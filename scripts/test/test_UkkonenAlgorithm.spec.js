let { UkkonenAlgo, Node } = require("../UkkonenAlgo");
const assert = require('chai').assert;


function checkSingleSubstring(str, algo)
{
    let currentBranch = algo.root;
    let localIndex = 0;

    for (let letter of str)
    {
        if (localIndex+1 >= currentBranch.length())
        {
            // switch to the next branch
            currentBranch = currentBranch.getChild(letter);
            if (currentBranch === undefined) {return "for suffix '" + str + "' there is no path";}
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
                return "for suffix '" + str + "' there is no path";
            }
        }
    }

    if (currentBranch.isLeaf() && currentBranch.length() === localIndex+1)
    {
        return true;
    }
    else { return "for suffix '" + str + "' we haven't got to a leaf node"; }
}

function checkSubstring(str, algo)
{
    str = str + '$';
    for (let i = 0; i < str.length; ++i)
    {
        substr = str.substring(i);

        let res = checkSingleSubstring(substr, algo);
        if (res !== true)
        {
            return res;
        }
    }
    return true;
}

function buildAndCheck(str)
{
    let algo = new UkkonenAlgo();

    for (let [i, l] of str.split("").entries())
    {
        algo.add_letter(l);
    }

    algo.add_letter('$');

    checkSubstring(str, algo);
}


describe("UkkonenAlgo", function() {
    it("adding first letter should start a branch", () => {
        let algo = new UkkonenAlgo();
        algo.add_letter("a");

        assert.equal(algo.root.letterToChild.size, 1)
        assert.equal(true, algo.root.letterToChild.has('a'));
        assert.equal(algo.root.letterToChild.get('a').begin, 0);
    });

    it("adding two different letters adds two branches", () => {
        let algo = new UkkonenAlgo();
        algo.add_letter("a");
        algo.add_letter("b");

        assert.equal(algo.root.childrenAmount(), 2);
        assert.equal(algo.root.getChild('a').getBeginIndex(), 0);
        assert.equal(algo.root.getChild('b').getBeginIndex(), 1);
    });

    it("adding the same letter two times", () => {
        let algo = new UkkonenAlgo();
        algo.add_letter("a");
        algo.add_letter("a");

        assert.equal(algo.root.childrenAmount(), 1);
        assert.equal(algo.root.getChild('a').getBeginIndex(), 0);
    });

    it("adding same pair should set localIndex to 1", () => {
        let algo = new UkkonenAlgo();
        algo.add_letter("a");
        algo.add_letter("b");
        algo.add_letter("a");
        algo.add_letter("b");

        assert.equal(algo.root.childrenAmount(), 2);
        assert.equal(algo.root.getChild('a').getBeginIndex(), 0);
        assert.equal(algo.root.getChild('b').getBeginIndex(), 1);
        assert.equal(algo.getCurrentBranchBeginIndex(), 0);

        algo.add_letter("$");
        assert.equal(checkSubstring("abab", algo), true);
    });

    it("new sub branch", () => {
        let algo = new UkkonenAlgo();
        algo.add_letter("a");
        algo.add_letter("b");
        algo.add_letter("a");
        algo.add_letter("c");

        /*

        ba  /
           /
          *      -------> 
           \
         aba\


           / a
     c \  / b
        *
        a \
           *---- c
            \
         ba  \
        */

        assert.equal(algo.root.childrenAmount(), 3);
        let aNode = algo.root.letterToChild.get('a'); 
        assert.equal(aNode.letterToChild.size, 2);

        algo.add_letter("$");
        assert.equal(checkSubstring("abac", algo), true);
    });

    it("create suffix reference", () => {
        let algo = new UkkonenAlgo();
        algo.add_letter("a");
        algo.add_letter("b");
        algo.add_letter("c");
        algo.add_letter("a");
        algo.add_letter("b");
        /*
        - abcab
           |

        - bcab
        - cab
        */

       assert.equal(3, algo.root.childrenAmount());
       assert.equal(0, algo.getCurrentBranchBeginIndex());
       // assert.equal(algo.getGlobalIndex(), 2);


        algo.add_letter("b");

        /*
        - ab
          - b
          - cabb
        - b
          - b
          - cabb
        - cabb
        */

       assert.equal(3, algo.root.childrenAmount());
       let child = algo.root.getChild('b');
       assert.equal(2, child.childrenAmount());
       
       
       algo.add_letter("$");
       assert.equal(checkSubstring("abcabb", algo), true);
    });

    it("yet another test", () => {
        let algo = new UkkonenAlgo();

        algo.add_letter("a");
        algo.add_letter("b");
        algo.add_letter("c");
        algo.add_letter("a");
        algo.add_letter("x");
        algo.add_letter("a");
        algo.add_letter("b");
        algo.add_letter("d");

        algo.add_letter("$");
        assert.equal(checkSubstring("abcaxabd", algo), true);
    })

    it("complicated thing", () => {
        let text = "tstatbtctstabtct"
        let algo = new UkkonenAlgo();

        for (let letter of text) {
            algo.add_letter(letter);
        }
        algo.add_letter('$');

        let root = algo.root;

        assert.equal(root.childrenAmount(), 6);

        let tNode = root.getChild('t');

        assert.equal(tNode.childrenAmount(), 5);

        assert.equal(checkSubstring(text, algo), true);

        /*
        - $
        - atbtct
            - $
            - statbbtct$
        - btct
            - $
            - statbbtct$
        - ct
            - $
            - statbbtct$
        - statbtct
            - $
            - statbbtct$
        - t
            - atbtct
                - $
                - statbbtct$
            - btct
                - $
                - statbbtct$
            - ct
                - $
                - statbbtct$
            - statbtct
                - $
                - statbbtct$
        */

       assert.equal(checkSubstring(text, algo), true);
    })

    it("complicated thing 2", () => {
        let text = "mississip";
        let algo = new UkkonenAlgo();

        for (let l of text)
        {
            algo.add_letter(l);
        }

        algo.add_letter('$');
        

        assert.equal(checkSubstring(text, algo), true);
    })

    it("complicated thing 3", () => {
        let text = "missississiissip";
        let algo = new UkkonenAlgo();

        for (let l of text)
        {
            algo.add_letter(l);
        }

        algo.add_letter('$');
        assert.equal(checkSubstring(text, algo), true);
    })

    it("complicated thing 4", () => {
        let text = "mississipississt";
        let algo = new UkkonenAlgo();

        for (let l of text)
        {
            algo.add_letter(l);
        }

        algo.add_letter('$');
        assert.equal(checkSubstring(text, algo), true);
    })

    it("It is estimated a third of dementia cases could be prevented, and this report provides the best available prevention advice.", () =>{
        let text = "It is estimated a third of dementia cases could be prevented, and this report provides the best available prevention advice.";

        buildAndCheck(text);
    })

    it("restore check", () => {
        let text = "miss";

        let algo = new UkkonenAlgo();
        for (let l of text)
        {
            algo.add_letter(l);
        }
        algo.doStepBack();
    })
});