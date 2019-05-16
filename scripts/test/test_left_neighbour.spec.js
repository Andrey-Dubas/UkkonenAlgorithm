let { get_left_neighbour, Trie, Node } = require("../TrieVisualizer");

const assert = require('chai').assert;

describe("get_let_neighbour", function() {
    it("should return null for root", function() {
        assert.equal(get_left_neighbour(new Node()), null);
    })

    it("should return leftmost element", function() {
        let root = new Node();

        let left = new Node();
        let right = new Node();

        root.addChild(left);
        root.addChild(right);
        assert.equal(get_left_neighbour(right), left);
    })

    it("should return grandchild", function() {
        let root = new Node();
        
        let left_child = new Node();
        let right_child = new Node();

        let left_right_grandchild = new Node();
        let right_left_grandchild = new Node();

        left_child.addChild(left_right_grandchild);
        right_child.addChild(right_left_grandchild);

        left_child.addChild(left_right_grandchild);
        right_child.addChild(right_left_grandchild);

        root.addChild(left_child);
        root.addChild(right_child);
        
        assert.equal(get_left_neighbour(right_left_grandchild), left_right_grandchild);
    })

    it("should return null (for leftmost element)", function() {
        let root = new Node();
        
        let left_child = new Node();
        let right_child = new Node();

        let left_right_grandchild = new Node();
        let right_left_grandchild = new Node();

        left_child.addChild(left_right_grandchild);
        right_child.addChild(right_left_grandchild);

        left_child.addChild(left_right_grandchild);
        right_child.addChild(right_left_grandchild);

        root.addChild(left_child);
        root.addChild(right_child);
        
        assert.equal(get_left_neighbour(left_right_grandchild), null);
    })

    it("complicated:)", function() {
        Node.constructor.num = undefined;
        let root = new Node();

        let left_node = new Node();

        left_node.addChild(new Node());

        let subchild = new Node();
        subchild.addChild(new Node());
        subchild.addChild(new Node());
        let target = new Node();
        subchild.addChild(target);

        left_node.addChild(subchild);

        let n1 = new Node();

        let src = new Node();
        n1.addChild(src)
        left_node.addChild(n1);

        root.addChild(left_node);

        let right_node = new Node();

        let subnode1 = new Node();
        subnode1.addChild(new Node());
        subnode1.addChild(new Node());
        subnode1.addChild(new Node());

        right_node.addChild(subnode1);
        right_node.addChild(new Node());
        right_node.addChild(new Node());

        root.addChild(right_node);

        assert.equal(get_left_neighbour(src), target);

    })

    it("compilated:) passed params in constructior", function() {
        Node.constructor.num = undefined;
        
        let src = new Node();
        let target = new Node();

        let root = new Node(
            new Node(
                new Node(),
                new Node(
                    new Node(),
                    new Node(),
                    target
                ),
                new Node(
                    src
                )
            ),

            new Node(
                new Node(
                    new Node(),
                    new Node(),
                    new Node(),
                ),
                new Node(),
                new Node()
            ) 
        );

        assert.equal(get_left_neighbour(src), target);

    })
});
