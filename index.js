const { Client, Collection, Intents} = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

class Node {
    constructor(value) {
      this.value = value;
      this.adjacents = []; // adjacency list
    }
  
    addAdjacent(node) {
      this.adjacents.push(node);
    }
  
    removeAdjacent(node) {
      const index = this.adjacents.indexOf(node);
      if(index > -1) {
        this.adjacents.splice(index, 1);
        return node;
      }
    }
  
    getAdjacents() {
      return this.adjacents;
    }
  
    isAdjacent(node) {
      return this.adjacents.indexOf(node) > -1;
    }
  }

class Graph {
  constructor() {
    this.nodes = new Map();
    this.cycle = [];
    this.edge_names = new Map();
  }

  getAllEdges(username){
    var output = "";
    for(const [keys, values] of this.edge_names){
      for(const [mkeys, mvalues] of values){
        if(mvalues.indexOf(username)>-1){
          output+=("Desired Drop: " +keys+" -> Desired Target: "+mkeys +"\n");
        }
      }
    }
    return output;
  }

  removeUser(username){
    var output = "";
    for(var [keys, values] of this.edge_names){
      for(var [mkeys, mvalues] of values){
        while(mvalues.indexOf(username)>-1){
          this.removeEdgeUser(keys, mkeys, username);
        }
      }
    }
  }

  removeEdgeUser(source, destination, username){
    if(this.edge_names.has(source) && this.edge_names.get(source).has(destination) && this.edge_names.get(source).get(destination).indexOf(username)>-1){
      var index = this.edge_names.get(source).get(destination).indexOf(username);
      this.edge_names.get(source).get(destination).splice(index, 1);
      if(this.edge_names.get(source).get(destination).length==0){
        this.edge_names.get(source).delete(destination);
        this.removeEdge(source, destination);
      }
      if(!this.edge_names.get(source).length==0){
        this.edge_names.delete(source);
      }
      return true;
    }
    return false;
  }

  addEdge(source, destination, username) {
    const sourceNode = this.addVertex(source);
    const destinationNode = this.addVertex(destination);
  
    sourceNode.addAdjacent(destinationNode);
    if(this.edge_names.has(source)){
      if(this.edge_names.get(source).has(destination)){
        this.edge_names.get(source).get(destination).push(username);
      }else{
        this.edge_names.get(source).set(destination, [username]);
      }
    }else{
      var newMap = new Map(); 
      newMap.set(destination, [username]);
      this.edge_names.set(source, newMap);
    }

    return [sourceNode, destinationNode];
  }

  addVertex(value) {
    if(this.nodes.has(value)) {
      return this.nodes.get(value);
    } else {
      const vertex = new Node(value);
      this.nodes.set(value, vertex);
      return vertex;
    }
  }

  removeVertex(value) {
    const current = this.nodes.get(value);
    if(current) {
      for (const node of this.nodes.values()) {
        node.removeAdjacent(current);
      }
    }
    return this.nodes.delete(value);
  }

  removeEdge(source, destination) {
    const sourceNode = this.nodes.get(source);
    const destinationNode = this.nodes.get(destination);
  
    if(sourceNode && destinationNode) {
      sourceNode.removeAdjacent(destinationNode);
    }

    return [sourceNode, destinationNode];
  }

  detectCycle(){
      const graphNodes = this.nodes;
      const visited = {};
      const recStack = {};
      const memory = [];
      for(let [, value] of graphNodes){
          const ans = this.detectCycleHelper(value, visited, recStack, memory);
          if(ans) return true;
      }
      return false;
  }

  detectCycleHelper(vertex, visited, recStack, memory){
      if(!visited[vertex.value]){
          visited[vertex.value] = true;
          recStack[vertex.value] = true;
          memory.push(vertex.value);
          const nodeNeighbors = vertex.getAdjacents();
          for(let i = 0; i<nodeNeighbors.length; i++){
            const currentNode = nodeNeighbors[i];
            if(!visited[currentNode.value] && this.detectCycleHelper(currentNode, visited, recStack, memory)){
                const index = memory.indexOf(vertex.value);
                this.cycle = memory.slice(index);
                return true;
            }else if(recStack[currentNode.value]){
                return true;
            }
          }
      }
      recStack[vertex.value] = false;
      memory.pop();
      return false;
  }

  detectCycleWithEdge(index, visited, recStack, memory){
    const vertex = graph.addVertex(index);
    if(!visited[vertex.value]){
        visited[vertex.value] = true;
        memory.push(index);
        const nodeNeighbors = vertex.getAdjacents();
        for(let i = 0; i<nodeNeighbors.length; i++){
          const currentNode = nodeNeighbors[i];
          if(!visited[currentNode.value] && this.detectCycleWithEdge(currentNode.value, visited, recStack, memory)){
              this.cycle = memory; 
              return true;
          }else if(index == memory[0]){
              return true;
          }
        }
    }
    memory.pop();
    return false;
}
}


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

var graph = new Graph();

prefix = "!"

client.once('ready', () => {
	console.log('Ready!');
  const status = "!help"
  client.user.setActivity(status, { type: 'LISTENING' });
});


client.on('messageCreate', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const withoutPrefix = message.content.slice(prefix.length);
	const split = withoutPrefix.split(/ +/);
	const command = split[0];
	const args = split[1];
  const usernametag = "<@" + message.author.id + ">";

    if(command == "searchAll"){
      if(graph.detectCycle()){
        message.reply("A cycle has been found in the graph!");
        var output = "";
        for(let i = 0; i<graph.cycle.length-1; i++){
          output+=(graph.cycle[i] + "->" + graph.cycle[i+1] + ": Potential Users Include:" + graph.edge_names.get(graph.cycle[i]).get(graph.cycle[i+1]) + "\n");
        }
        message.reply(output);
      }else{
        message.reply("no cycle exists at the moment")
      }
      return;
    }else if(command == "queryAll"){
      for(const [keys, values] of graph.edge_names){
        for(const [mkeys, mvalues] of values){
          if(mvalues.indexOf(usernametag)>-1){
            let source = keys;
            let target = mkeys;
            if(graph.detectCycleWithEdge(target, [], {source:true}, [source])){
              message.reply("A cycle has been found using " + keys + " -> " + mkeys);
              var output = "Potential Cycle Found: \n\n";
              for(let i = 0; i<graph.cycle.length-1; i++){
                output+=("Step "+ (i+1) + ": drop " +graph.cycle[i] + " and register for " + graph.cycle[i+1] + "\n\t Potential Users: " + graph.edge_names.get(graph.cycle[i]).get(graph.cycle[i+1]) + "\n");
              }
              message.reply(output);
            }else{
              message.reply("No cycle found with " + keys + " -> " + mkeys); 
            }
          }
        }
      }
      return;
    }
    else if(command == "query"){
      if(split.length!=3) return message.reply("Incorrect Format. Please enter an input of the form '!add currentCRN targetCRN'")
        else{            
            let source = split[1];
            let target = split[2];
            if(graph.detectCycleWithEdge(target, [], {source:true}, [source])){
              message.reply("A cycle has been found using this edge!");
              var output = "Potential Cycle Found: \n\n";
              for(let i = 0; i<graph.cycle.length-1; i++){
                output+=("Step "+ (i+1) + ": drop " +graph.cycle[i] + " and register for " + graph.cycle[i+1] + "\n\t Potential Users: " + graph.edge_names.get(graph.cycle[i]).get(graph.cycle[i+1]) + "\n");
              }
              message.reply(output);
            }else{
              message.reply("No cycle found with the given edge");
            }
            return;
        }
    }
    else if(command == "add"){
        if(split.length!=3) return message.reply("Incorrect Format. Please enter an input of the form '!query currentCRN targetCRN'")
        else{
            add(split[1], split[2], "<@" + message.author.id + ">");
            
            message.reply("Added connection (Droppable: " + split[1] + ", Target: " + split[2] + ") for user " + "<@" + message.author.id + ">");
            let source = split[1];
            let target = split[2];
            if(graph.detectCycleWithEdge(target, [], {source:true}, [source])){
              message.reply("A cycle has been found using this edge!");
              var output = "Potential Cycle Found: \n\n";
              for(let i = 0; i<graph.cycle.length-1; i++){
                output+=("Step "+ (i+1) + ": drop " +graph.cycle[i] + " and register for " + graph.cycle[i+1] + "\n\t Potential Users: " + graph.edge_names.get(graph.cycle[i]).get(graph.cycle[i+1]) + "\n");
              }
              message.reply(output);
            }
            return;
        }
    }else if(command=="getAllEdges"){
      const output = graph.getAllEdges(usernametag);
      if(output)
        return message.reply(output);
      else 
        return message.reply(usernametag + " isn't in our database yet");
    }
    else if(command=="remove"){
      if(split.length!=3) return message.reply("Incorrect Format. Please enter an input of the form '!remove currentCRN targetCRN'")
      else{
        let source = split[1];
        let target = split[2];
        if(graph.removeEdgeUser(source, target, usernametag)) message.reply("Edge has been removed");
        else message.reply("Edge doesn't exist");
        return;
      }
    }
    else if(command=="removeUser"){
      graph.removeUser(usernametag);
      return message.reply(usernametag+" has been removed from the database")
    }
    else if (command == "help"){
        return message.reply("Available functions:\n"+
            "!add [CRNdrop] [CRNadd]: Adds to graph and queries the course you are willing to drop and the course you wish to get into\n\n" +
            "!getAllEdges: returns all edges associated with the calling user\n\n" + 
            "!query [CRNdrop] [CRNadd]: checks for a cycle including the given edge. Can query for an edge that doesn't exist yet\n\n" +
            "!queryAll: checks every entry associated with the calling user for a cycle\n\n" +
            "!remove [CRNdrop] [CRNadd]: Removes an entry connecting CRNdrop to CRNadd made by the calling user\n\n"+
            "!removeUser: Removes all entries in database associated with the calling user\n\n"+
            "!searchAll: searches entire database for a cycle and returns a cycle if found\n\n" + 
            "!help: returns help menu");
    }
    message.reply("That isn't a valid command! Use !help to get a full list of acceptable commands and descriptions.");
    return;
});

function add(drop, target, username){
    graph.addVertex(drop);
    graph.addVertex(target);
    graph.addEdge(drop, target, username);
}


client.login(token);
