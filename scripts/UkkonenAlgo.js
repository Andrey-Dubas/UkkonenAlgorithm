
function climb(node, str)
{
    let currentBranch = node;
    let localIndex = -1;

    for (let letter of str)
    {
        if (localIndex+1 >= currentBranch.length() || localIndex === -1)
        {
            // switch to the next branch
            currentBranch = currentBranch.getChild(letter);
            if (currentBranch === undefined) {throw "for suffix '" + str + "' there is no path";}
            localIndex = 0;
        }

        else
        {
            // mode within branch
            let nextLetter = currentBranch.nodeText()[localIndex+1];
            if (letter === nextLetter)
            {
                ++localIndex;
            }
            else
            {
                throw "for suffix '" + str + "' there is no path";
            }
        }
    }

    return [currentBranch, localIndex];
}

class Node
{
    constructor(algo, parent, start_letter_index)
    {
        this.parent = parent;
        this.begin = start_letter_index;
        this.end = -1;
        this.algo = algo;
        
        this.letterToChild = new Map();
        this.suffixRef = algo.root;

        this.letter = this.algo.text[this.begin];
        this.subtext = this.nodeText();
    }

    addChild(node)
    {
        // this.indexToChild.set(node.begin, node);
        this.letterToChild.set(this.algo.text[node.begin], node);
    }

    text()
    {
        return this.algo.text;
    }

    has(letter)
    {
        return this.letterToChild.has(letter);
    }

    nodeText()
    {
        return this.algo.text.slice(this.begin, this.last_letter_index()+1);
    }

    last_letter_index()
    {
        return this.end === -1 ? this.text().length-1 : this.end;
    }

    getChild(key)
    {
        if (typeof(key) === "string")
        {
            return this.letterToChild.get(key);
        }
        else if (typeof key === "number")
        {
            return this.letterToChild.get(this.algo.text[key]);
        }
    }

    length()
    {
        if (this.begin === -1)
        {
            // case for root element
            return 0;
        }
        let last_index = this.last_letter_index();
        return last_index + 1 - this.begin;
    }

    getLocalIndex()
    {
        return this.algo.globalIndex - this.begin;
    }

    childrenAmount()
    {
        return this.letterToChild.size;
    }

    getBeginIndex()
    {
        return this.begin;
    }

    isLeaf()
    {
        return this.end === -1;
    }
};

export class UkkonenAlgo
{
    constructor()
    {
        this.text = "";
        this.root = new Node(this, -1, -1);
        this.root.parent = this.root;
        this.root.suffixRef = this.root;
        this.activeNode = this.root;
        this.remaining = 0;

        this.currentBranch = -1;
        this.globalIndex = -1;

        this.lastCreatedNode = this.root;

        this.retValues = {proceed: 0, stop: 1}

        this.restoreCommands = [];

        this.expansionIndex = -1;
    }

    localIndex()
    {
        if (this.globalIndex === -1)
        {
            return -1;
        }
        else
        {
            return this.globalIndex - this.forwardedCurrentBranch;
        }
    }

    // get next letter on current branch
    getNextLetter()
    {
        let child = this.forwardedActiveNode.getChild(this.forwardedCurrentBranch);
        let i = child.begin + (this.globalIndex-this.forwardedCurrentBranch) + 1;
        return this.text[i];
    }

    setNoneCurrentBranch()
    {
        this.currentBranch = -1;
        this.globalIndex = -1;
    }

    forwardActiveNode()
    {
        this.forwardedActiveNode = this.activeNode;
        this.forwardedCurrentBranch = this.currentBranch;

        if (this.activeNode.getChild(this.forwardedCurrentBranch))
        {
            let forwardedCurrentBranch = this.activeNode.getChild(this.forwardedCurrentBranch);
            while (this.localIndex() > forwardedCurrentBranch.length()-1)
            {
                this.forwardedActiveNode = forwardedCurrentBranch;
                let child = this.forwardedActiveNode.getChild(this.forwardedCurrentBranch + forwardedCurrentBranch.length());
                this.forwardedCurrentBranch += forwardedCurrentBranch.length();
                forwardedCurrentBranch = this.forwardedActiveNode.getChild(this.forwardedCurrentBranch);
            }

            if (this.localIndex() === forwardedCurrentBranch.length()-1)
            {
                this.forwardedActiveNode = forwardedCurrentBranch;
                this.forwardedCurrentBranch = -1;
            }
        }
    }

    expand_once()
    {
        let index = this.text.length -1;
        let letter = this.text[index];
        
        this.prevStateData = 
        {
            activeNode: this.activeNode,
            currentBranch: this.currentBranch,
            remaining: this.prevRemaining,
            text: this.prevText,
            globalIndex: this.globalIndex,
            lastCreatedNode: this.lastCreatedNode,
            expansionIndex: this.expansionIndex,

            doBaseRestore: function(algo) {
                algo.activeNode = this.activeNode;
                algo.currentBranch = this.currentBranch;
                algo.remaining = this.remaining;
                algo.text = this.text;
                algo.globalIndex = this.globalIndex;
                algo.lastCreatedNode = this.lastCreatedNode;
                algo.expansionIndex = this.expansionIndex;
            },

            doAdvancedRestore: function(algo) { // empty so far
            },

            doRestore: function(algo) {
                this.doAdvancedRestore(algo);
                this.doBaseRestore(algo);
                algo.forwardActiveNode();
            }
        }

        this.forwardActiveNode();

        // add new node to activeNode
        if (this.forwardedCurrentBranch === -1 && !this.forwardedActiveNode.has(letter))
        {
            let node = new Node(this, this.forwardedActiveNode, index);
            this.forwardedActiveNode.addChild(node);


            // state restoration
            this.prevStateData.removedLetter = this.text[index];
            this.prevStateData.removedIndex = this.text[index];
            this.prevStateData.doAdvancedRestore = function(algo)
            {
                this.activeNode.letterToChild.delete(this.removedLetter);
            }


            this.remaining--;
            this.activeNode = this.forwardedActiveNode.suffixRef;
            this.currentBranch = -1;

            this.expansionIndex++;

            return this.retValues.proceed;
        }

        // step in  onto current branch
        if (this.forwardedCurrentBranch === -1 && this.forwardedActiveNode.getChild(letter) !== undefined)
        {
            this.activeNode = this.forwardedActiveNode;
            this.currentBranch = index;
            this.globalIndex = this.currentBranch;
            return this.retValues.stop;
        }

        // move within currentBranch
        if (this.forwardedCurrentBranch !== -1 && this.getNextLetter() === letter)
        {
            this.globalIndex++;
            return this.retValues.stop;
        }

        
        // split branch
        if (this.forwardedCurrentBranch !== -1 && this.getNextLetter() !== letter)
        {
            let currentBranch = this.forwardedActiveNode.getChild(this.forwardedCurrentBranch);
            let endOfCurrent = currentBranch.end;
            currentBranch.end = currentBranch.begin + this.localIndex();
                
            let continuationNode = new Node(this, currentBranch, currentBranch.end + 1);
            continuationNode.end = endOfCurrent;
            continuationNode.suffixRef = currentBranch.suffixRef;
            currentBranch.suffixRef = this.root;

            continuationNode.letterToChild = currentBranch.letterToChild;
            currentBranch.letterToChild = new Map();
                
            let new_node = new Node(this, currentBranch, this.text.length-1);
                
            currentBranch.addChild(new_node);
            currentBranch.addChild(continuationNode);

            
            // state restoration
            this.prevStateData.parent = this.activeNode;
            this.prevStateData.splitBranch = currentBranch;
            this.prevStateData.continuationNode = continuationNode;
            this.prevStateData.doAdvancedRestore = function(algo)
            {
                this.splitBranch.letterToChild = this.continuationNode.letterToChild;
                this.splitBranch.end = this.continuationNode.end;
                this.splitBranch.suffixRef = algo.root;
            }


            if (this.lastCreatedNode !== this.root)
            {
                this.lastCreatedNode.suffixRef = currentBranch;
            }
            
            this.lastCreatedNode = currentBranch;
                

            this.expansionIndex++;
            
            if (this.forwardedActiveNode.suffixRef != this.root)
            {
                this.activeNode = this.forwardedActiveNode.suffixRef;
            }
            else
            {
                let next = this.activeNode.getChild(this.currentBranch).begin + 1;
                if (this.forwardedActiveNode.getChild(this.forwardedCurrentBranch+1) === this.forwardedActiveNode.getChild(this.forwardedCurrentBranch))
                {
                    // well that part I don't understand.
                    // that case is active when we can't get to our active node from the root climbing 
                    // up using the next suffix we need to add.
                    // Here we search new active node.
                    // I probably didn't get an algorithm of switching branches. Contact me if you have suggestions!

                    let txt1 = this.text.substring(this.expansionIndex+1, this.text.length-1);

                    let [currentBranch, localIndex] = climb(this.root, txt1);
                    this.activeNode = currentBranch.parent;
                    if (localIndex === -1)
                    {
                        this.currentBranch = -1;
                        this.globalIndex = -1;
                    }
                    else
                    {
                        this.currentBranch = currentBranch.begin;
                        this.globalIndex = currentBranch.begin + localIndex;
                    }

                }
                else if (this.activeNode.getChild(next))
                {
                    this.currentBranch++;
                }
                else
                {
                    this.activeNode = this.activeNode.suffixRef;
                }
            }
            if (this.globalIndex < this.currentBranch)
            {
                // if we get to that 'if' that means we get to the last suffix which is not yet added added to the root
                this.currentBranch = -1;
            }
            this.remaining--;

            return this.retValues.proceed;
        }
    }

    add_letter(letter)
    {
        this.prevText = this.text;
        this.prevRemaining = this.remaining;

        this.remaining++;
        this.text += letter;
        this.lastCreatedNode = this.root;

        while (true) {
            let state = this.expand_once(letter);
            this.restoreCommands.push(this.prevStateData);
            if (this.remaining === 0 || state === this.retValues.stop) {return;}
            this.prevText = this.text;
            this.prevRemaining = this.remaining;
        }
    }

    doStepBack()
    {
        let lastRedo = this.restoreCommands.pop();
        lastRedo.doRestore(this);
    }

    getGlobalIndex()
    {
        return this.globalIndex;
    }

    getCurrentBranchBeginIndex()
    {
        return this.activeNode.getChild(this.currentBranch).begin;
    }
};