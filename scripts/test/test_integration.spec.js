import { split_node_callback, add_node_callback, TrieVisualizer, Node, constructGraph } from "../TrieVisualizer";
import { UkkonenAlgo } from "../UkkonenAlgo";

describe("integration test", function() {
    it("test1", function() {
        let algo = new UkkonenAlgo();
        let root = algo.root;
        let graphic_root = new Node()
        root.split_node_callback = split_node_callback(graphic_root);
        root.add_node_callback = add_node_callback(graphic_root);
    })

    it("test2", function() {

        let window = {
            innerHeight: 0,
            innerWidth: 0
        };

        let document = {
            querySelector: function(str) {
                return {
                    getContext: function() {
                        return {
                            fillStyle: function(){},
                            beginPath: function(){},
                            arc: function(){},
                            stroke: function(){},
                            fillText: function(){},
                            moveTo: function(){},
                            lineTo: function(){},
                            translate: function(){},
                            rotate: function(){},
                            save: function(){},
                            restore: function(){},
                            fill: function(){},
                            clearRect: function(){}
                        }
                    }
                };
            }
        }


        let algo = new UkkonenAlgo();
        let root = algo.root;
        let graphic_root = new Node();
        root.split_node_callback = split_node_callback(graphic_root);
        root.add_node_callback = add_node_callback(graphic_root);
        root.__graph_node = graphic_root;
        graphic_root.algo_node = root;

        algo.add_letter('a');
        algo.add_letter('b');
        algo.add_letter('b');
        algo.add_letter('c');
        algo.add_letter('a');

        let trie = new TrieVisualizer(graphic_root);
        let canvas = document.querySelector("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        trie.draw(canvas);
    })


    it("test2", function() {

        let window = {
            innerHeight: 0,
            innerWidth: 0
        };

        let document = {
            querySelector: function(str) {
                return {
                    getContext: function() {
                        return {
                            fillStyle: function(){},
                            beginPath: function(){},
                            arc: function(){},
                            stroke: function(){},
                            fillText: function(){},
                            moveTo: function(){},
                            lineTo: function(){},
                            translate: function(){},
                            rotate: function(){},
                            save: function(){},
                            restore: function(){},
                            fill: function(){},
                            clearRect: function(){}
                        }
                    }
                };
            }
        }


        let algo = new UkkonenAlgo();
        let root = algo.root;
        let graphic_root = new Node();
        root.__graph_node = graphic_root;
        root.split_node_callback = split_node_callback(graphic_root);
        root.add_node_callback = add_node_callback(graphic_root);
        graphic_root.algo_node = root;

        algo.add_letter('m');
        algo.add_letter('i');
        algo.add_letter('s');
        algo.add_letter('s');
        algo.add_letter('i');
        algo.add_letter('s');
        algo.add_letter('s');
        algo.add_letter('i');
        algo.add_letter('p');
        // algo.add_letter('i');
        algo.add_letter('$');

        let trie = new TrieVisualizer(graphic_root);
        let canvas = document.querySelector("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        trie.draw(canvas);
    })

    it("step-by-step integration test", function() {

        let window = {
            innerHeight: 0,
            innerWidth: 0,
            stack: []
        };

        let document = {
            querySelector: function(str) {
                return {
                    getContext: function() {
                        return {
                            fillStyle: function(){},
                            beginPath: function(){},
                            arc: function(){},
                            stroke: function(){},
                            fillText: function(){},
                            moveTo: function(){},
                            lineTo: function(){},
                            translate: function(){},
                            rotate: function(){},
                            save: function(){},
                            restore: function(){},
                            fill: function(){},
                            clearRect: function(){}
                        }
                    }
                };
            }
        }

        let text = "mississip";

        let algo = new UkkonenAlgo(text.length+1);
        let root = algo.root;
        let graphic_root = new Node();
        root.__graph_node = graphic_root;
        root.split_node_callback = split_node_callback(graphic_root);
        root.add_node_callback = add_node_callback(graphic_root);
        graphic_root.algo_node = root;

        let trie = new TrieVisualizer(graphic_root);
        let canvas = document.querySelector("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let index = 0;
        let isNextLetter = true;
        while (index < text.length)
        {
            window.stack.push([index, isNextLetter]);
            let letter = text[index];
            if (isNextLetter)
            {
                algo.text += text[index];
                isNextLetter = false;
                algo.lastCreatedNode = null;
                algo.remaining++;
                algo.lastCreatedNode = algo.root;
            }
            // algo.remaining = 1;
        
            let ret = algo.expand_once(letter);
            if (ret === algo.retValues.stop || algo.remaining === 0)
            {
                ++index;
                isNextLetter = true;
                // 
            }

            trie.draw(canvas);
        }

        let last = 0;
    })


    it("step back test", function() {

        let window = {
            innerHeight: 0,
            innerWidth: 0,
            stack: []
        };

        let document = {
            querySelector: function(str) {
                return {
                    getContext: function() {
                        return {
                            fillStyle: function(){},
                            beginPath: function(){},
                            arc: function(){},
                            stroke: function(){},
                            fillText: function(){},
                            moveTo: function(){},
                            lineTo: function(){},
                            translate: function(){},
                            rotate: function(){},
                            save: function(){},
                            restore: function(){},
                            fill: function(){},
                            clearRect: function(){}
                        }
                    }
                };
            }
        }


        let algo = new UkkonenAlgo();
        let root = algo.root;
        let graphic_root = new Node();
        root.__graph_node = graphic_root;
        root.split_node_callback = split_node_callback(graphic_root);
        root.add_node_callback = add_node_callback(graphic_root);
        graphic_root.algo_node = root;

        let trie = new TrieVisualizer(graphic_root);
        let canvas = document.querySelector("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        

        let text = "mississip";

        let index = 0;
        let isNextLetter = true;
        while (index < text.length)
        {
            window.stack.push([index, isNextLetter]);
            let letter = text[index];

            if (isNextLetter)
            {
                algo.text += text[index];
                isNextLetter = false;
                algo.lastCreatedNode = algo.root;
                algo.remaining++;
            }
        
            let ret = algo.expand_once(letter);
            if (ret === algo.retValues.stop || algo.remaining === 0)
            {
                ++index;
                isNextLetter = true;
                // 
            }

            trie.draw(canvas);
        }

        let arr = window.stack.pop();
        index = arr[0];
        isNextLetter = arr[1];

        trie.draw(canvas);


        let last = 0;
    })
})


