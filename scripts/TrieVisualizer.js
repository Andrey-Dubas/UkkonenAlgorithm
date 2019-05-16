
export function split_node_callback(graphic_node)
{
    function impl() {
        graphic_node.split_node_callback(...arguments);
    }
    return impl;
}

export function add_node_callback(graphic_node)
{
    function impl() {
        graphic_node.add_node_callback(...arguments)
    }
    return impl;
}

export class Node
{
	constructor(...children_nodes)
	{
        if( typeof constructor.num === 'undefined' ) {
            constructor.num = 1;
        }
        this.children = [];
        this.parent = null;

        this.name = (++constructor.num).toString(10);
        
        this.x = -1;
        this.y = -1;

        this.algo_node = null;


        //for (let value of children)
        for (let i = 0; i < children_nodes.length; ++i)
        {
            this.addChild(children_nodes[i]);
        }
    }

    edgeInfo()
    {
        if (this.algo_node !== null)
        {
            return this.algo_node.nodeText();
        }
        return "undef";
    }
    
    addChild(node)
    {
        node.parent = this;
        this.children.push(node);
    }

    split_node_callback(localIndex, new_node_index, node1, node2)
    {
        let text = node1.algo.text;

        let graph_child1 = new Node();
        node1.add_node_callback = add_node_callback(graph_child1);
        node1.split_node_callback = split_node_callback(graph_child1);
        graph_child1.algo_node = node1;
        node1.__graph_node = graph_child1;

        for (let old_child of this.children)
        {
            graph_child1.addChild(old_child);
        }
        this.children = [];
        
        this.addChild(graph_child1);

        let graph_child2 = new Node();
        node2.add_node_callback = add_node_callback(graph_child2);
        node2.split_node_callback = split_node_callback(graph_child2);
        this.addChild(graph_child2);
        graph_child2.algo_node = node2;
        node2.__graph_node = graph_child2;
    }

    add_node_callback(begin, node)
    {
        let graph_node = new Node();
        node.add_node_callback = add_node_callback(graph_node);
        node.split_node_callback = split_node_callback(graph_node);
        this.addChild(graph_node);
        graph_node.algo_node = node;
    }
	
};

export function get_left_neighbour(node)
{
    let txt = node.name;
    if (node.parent === null) {return null;}
    let depth = 0;
    do 
    {
        var parent = node.parent;
        var index = parent.children.indexOf(node);
        if (parent == null)
        {
            return null;
        }
        depth++;
        node = parent;
    } while (index === 0 && node.parent !== undefined && node.parent !== null);

    let tempNode = new Node();

    for (let i = 0; i < index; ++i)
    {
        tempNode.children.push(parent.children[i]);
    }

    let nodes = [tempNode];
    let nextNodes = [];
    while (depth && nodes.length)
    {
        for (let i = 0; i < nodes.length; ++i)
        {
            for (let child of nodes[i].children.reverse())
            {
                nextNodes.push(child);
            }
        }
        nodes = nextNodes;
        nextNodes = [];
        --depth;
    }

    if (depth == 0) { return nodes[0];}

    return null;
}

function nodeDraw(context, node, x, y, r)
{
    context.beginPath();
    context.arc(x, y, r, 0, 2*Math.PI);
    context.stroke();

    if (node.algo_node.algo.forwardedActiveNode === node.algo_node)
    {
        context.save();

        context.fillStyle = "blue"
        context.beginPath();
        context.arc(x, y, r, 0, 2*Math.PI);
        context.fill();

        context.restore();
    }

    node.x = x;
    node.y = y;

    context.font = r + "px serif";
    // context.fillText(node.name, x - r/3 - node.name.length*r/6, y+r/3);
}

function drawEdge(context, node, x, y, r)
{   
    let x_start = node.parent.x;
    let y_start = node.parent.y;

    let x_end = x;
    let y_end = y;

    let dx = x_end - x_start;
    let dy = y_end - y_start;
    let angle = Math.atan(dy/dx);

    context.beginPath();
    context.moveTo(x_start + r*Math.cos(angle), y_start + r*Math.sin(angle));
    context.lineTo(x_end - r*Math.cos(angle), y_end - r*Math.sin(angle));
    context.stroke();

    context.translate(x_start, y_start);
    context.rotate(angle);
    
    context.font = dx*2/node.edgeInfo() + "px serif";
    
    let txt = node.edgeInfo();
    if (node.algo_node.algo.forwardedActiveNode === node.parent.algo_node &&
        node.parent.algo_node.getChild(node.algo_node.algo.forwardedCurrentBranch) === node.algo_node &&
        node.algo_node.algo.forwardedCurrentBranch !== -1)
    {
        let localIndex = node.algo_node.algo.globalIndex - node.algo_node.algo.forwardedCurrentBranch;
        txt = node.edgeInfo().substring(0, localIndex+1) 
            + '|' //+ " ->" + node.edgeInfo()[localIndex] + "<- "
            + node.edgeInfo().substring(localIndex+1);
    }
    context.fillText(txt, dx/3, -5);

    context.rotate(-angle);
    context.translate(-x_start, -y_start);
}

function drawReference(context, start_node, end_node, r)
{
    let x_start = start_node.x;
    let y_start = start_node.y;

    let x_end = end_node.x;
    let y_end = end_node.y;

    let dx = x_end - x_start;
    let dy = y_end - y_start;
    let angle = Math.atan(dy/dx);
    if (dx < 0) {angle = Math.PI + angle;}

    context.save();
    context.strokeStyle = 'blue';


    context.beginPath();
    context.moveTo(x_start + r*Math.cos(angle), y_start + r*Math.sin(angle));
    context.lineTo(x_end - r*Math.cos(angle), y_end - r*Math.sin(angle));

    let arrowAngle = 0.2;
    context.lineTo(x_end - r*Math.cos(angle) - r*Math.cos(angle+ arrowAngle), y_end - r*Math.sin(angle)  - r*Math.sin(angle+ arrowAngle));
    context.moveTo(x_end - r*Math.cos(angle), y_end - r*Math.sin(angle));
    context.lineTo(x_end - r*Math.cos(angle) - r*Math.cos(angle-arrowAngle), y_end - r*Math.sin(angle)  - r*Math.sin(angle-arrowAngle));

    context.stroke();

    context.restore();
}

export class TrieVisualizer
{
    constructor(root)
    {
        this.root = root;
    }

    
    getNodesInLevels()
    {
        let nodes = [this.root];
        let nextLevelNodes = [];
        let result = [[this.root]];

        while (nodes.length)
        {
            for (let node of nodes)
            {
                nextLevelNodes.push(...node.children);
            }
            result.push(nextLevelNodes);
            nodes = nextLevelNodes;
            nextLevelNodes = [];
        }
        return result;
    }

    __print_impl(node, level)
    {
        for (let child of node.children)
        {
            __print_impl(child, level+1);
        }

    }

    print()
    {
        __print_impl(this.root, 0);
    }

    draw(canvas, nodeDrawer, connectionDrawer)
    {
        if (nodeDrawer === undefined)
        {
            nodeDrawer = nodeDraw;
        }

        if (connectionDrawer === undefined)
        {
            connectionDrawer = drawEdge;
        }

        let allNodes = this.getNodesInLevels();
        
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        let dx = canvas.width / (allNodes.length + 1); // |     O      | - one node makes 2 half plains
        let current_x = dx;
        let r = Math.min(dx/10, canvas.width/10, 20);
        

        context.fillStyle = "red";

        nodeDrawer(context, this.root, current_x, canvas.height/2, r);
        
        this.root.x = dx;
        this.root.y = canvas.height/2;
        for (let currentLevelNodes of allNodes.slice(1, allNodes.length))
        {
            
            current_x += dx;
            let dy = canvas.height / (currentLevelNodes.length + 1);
            let bundleNumber = 0;
            
            let bundleSize;
            let leftmost_y;
            for (let node of currentLevelNodes)
            {
                if (node.parent.children[0] === node) {

                    bundleSize = node.parent.children.length;
                    let distance_to_center_y = node.parent.y - (bundleSize+1)*0.5*dy - canvas.height/2;
                    leftmost_y = canvas.height/2 + distance_to_center_y * 0.7;

                    bundleNumber = 1;
                    let leftmost_el = get_left_neighbour(node);
                    if (leftmost_el) {
                        leftmost_y = Math.max(leftmost_y, leftmost_el.y);
                    }
                }

                let height_diff = bundleNumber * dy * 0.7;
                nodeDrawer(context, node, current_x, leftmost_y + height_diff, r);
                connectionDrawer(context, node, current_x, leftmost_y + height_diff, r);
                bundleNumber++;
            }
        }

        for (let currentLevelNodes of allNodes.slice(1, allNodes.length))
        {
            for (let node of currentLevelNodes)
            {
                if (node.algo_node.suffixRef !== this.root.algo_node)
                {
                    if (node.algo_node.suffixRef !== undefined)
                    {
                        drawReference(context, node, node.algo_node.suffixRef.__graph_node, r);
                    }
                }
            }
        }

    }
};

function constructNodes(node, algo, parent = null)
{
    let graphNode = new Node();
    graphNode.algo_node = node;
    node.__graph_node = graphNode;
    graphNode.algo = algo;
    graphNode.parent = parent;
    graphNode.name = "";
    graphNode.x = -1;
    graphNode.y = -1;

    for (let child of node.letterToChild.values())
    {
        graphNode.addChild(constructNodes(child, algo, graphNode));
    }

    return graphNode;

}
export function constructGraph(algo)
{
    let trie = new TrieVisualizer();
    trie.root = constructNodes(algo.root, algo);
    return trie;
}
