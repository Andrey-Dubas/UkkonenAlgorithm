import { TrieVisualizer, Node, constructGraph } from "./TrieVisualizer";
import { UkkonenAlgo } from "./UkkonenAlgo";

let algo = new UkkonenAlgo();
let root = algo.root;

let graphic_root = new Node();

let trie = new TrieVisualizer(graphic_root);
let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let index = 0;
let isNextLetter = true;
window.stack = [];
window.text = "";

window.restartAnimation = function()
{
    algo =  new UkkonenAlgo();
    root = algo.root;
    graphic_root = new Node();

    root.__graph_node = graphic_root;
    graphic_root.algo_node = root;

    trie = constructGraph(algo);
    trie.draw(canvas);

    index = 0;
    let isNextLetter = true;
    window.stack = [];
    window.text = "";
}

window.start_algo = function()
{
    window.restartAnimation();
    let input_field = document.querySelector("#algo_input");
    window.text = input_field.value + "$";

    let appendButton = document.querySelector("#appendButton");
    appendButton.disabled = false;
}

window.append_letter = function()
{
    algo.prevText = algo.text;
    algo.prevRemaining = algo.remaining;

    window.stack.push([index, isNextLetter]);

    let letter = window.text[index];
    if (isNextLetter)
    {
        algo.text += window.text[index];
        isNextLetter = false;
        algo.lastCreatedNode = algo.root;
        algo.remaining++;
    }

    let ret = algo.expand_once(letter);
    if (ret === algo.retValues.stop || algo.remaining === 0)
    {
        ++index;
        isNextLetter = true;
    }

    algo.restoreCommands.push(algo.prevStateData);
    
    algo.forwardActiveNode();

    trie = constructGraph(algo);
    trie.draw(canvas);
    var remainer_field = document.querySelector("#var-remainder");
    remainer_field.textContent = algo.remaining;

    var textProgress = document.querySelector("#var-text-progress");
    textProgress.textContent = algo.text.substring(0, algo.expansionIndex+1) + " | " + algo.text.substring(algo.expansionIndex+1);


    if (index === window.text.length)
    {
        let button = document.querySelector("#appendButton");
        button.disabled = true;
    }

    let button = document.querySelector("#prevStateButton");
    button.disabled = false;
}

window.set_previous_state = function()
{
    let arr = window.stack.pop();

    algo.doStepBack();
    trie = constructGraph(algo);
    
    index = arr[0];
    isNextLetter = arr[1];

    if (algo.restoreCommands.length == 0)
    {
        let button = document.querySelector("#prevStateButton");
        button.disabled = true;
    }

    let button = document.querySelector("#appendButton");
    button.disabled = false;

    trie.draw(canvas);
    var remainer_field = document.querySelector("#var-remainder");
    remainer_field.textContent = algo.remaining;

    var textProgress = document.querySelector("#var-text-progress");
    textProgress.textContent = algo.text.substring(0, algo.expansionIndex+1) + " | " + algo.text.substring(algo.expansionIndex+1);
}