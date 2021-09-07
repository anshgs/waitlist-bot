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
      //console.log("I've been called upon");
      const graphNodes = this.nodes;
      //console.log(graphNodes);
      //console.log(graphNodes);
      const visited = {};
      const recStack = {};
      const memory = [];
      //console.log(graphNodes.keys())
      for(let [, value] of graphNodes){
          //console.log('reached?' + key);
          const ans = this.detectCycleHelper(value, visited, recStack, memory);
          //console.log(ans);
          if(ans) return true;
      }
      return false;
  }

  detectCycleHelper(vertex, visited, recStack, memory){
      //console.log('called');
      if(!visited[vertex.value]){
          visited[vertex.value] = true;
          recStack[vertex.value] = true;
          memory.push(vertex.value);
          console.log(memory + ".><.");
          const nodeNeighbors = vertex.getAdjacents();
          //console.log('reached');
          //console.log(nodeNeighbors);
          for(let i = 0; i<nodeNeighbors.length; i++){
            const currentNode = nodeNeighbors[i];
            if(!visited[currentNode.value] && this.detectCycleHelper(currentNode, visited, recStack, memory)){
                //console.log(recStack);
                const index = memory.indexOf(vertex.value);
                console.log(memory.slice(index));
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
    //console.log('called');
    const vertex = graph.addVertex(index);
    if(!visited[vertex.value]){
        visited[vertex.value] = true;
        //recStack[vertex.value] = true;
        memory.push(index);
        console.log(memory + ".><.");
        const nodeNeighbors = vertex.getAdjacents();
        //console.log('reached');
        //console.log(nodeNeighbors);
        for(let i = 0; i<nodeNeighbors.length; i++){
          const currentNode = nodeNeighbors[i];
          if(!visited[currentNode.value] && this.detectCycleWithEdge(currentNode.value, visited, recStack, memory)){
              //console.log(recStack);
              this.cycle = memory; //don't need index since you know its the first element
              return true;
          }else if(index == memory[0]){
              return true;
          }
        }
    }
    //recStack[vertex.value] = false;
    memory.pop();
    return false;
}
}


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

var graph = new Graph();

// client.commands = new Collection;
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for(const file of commandFiles){
//     const command = require(`./commands/${file}`);
//     client.commands.set(command.data.name, command);
// }

// for (const file of eventFiles) {
// 	const event = require(`./events/${file}`);
// 	if (event.once) {
// 		client.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		client.on(event.name, (...args) => event.execute(...args));
// 	}
// }

prefix = "!"

client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', async message => {
    //console.log(message.content);
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const withoutPrefix = message.content.slice(prefix.length);
	const split = withoutPrefix.split(/ +/);
	const command = split[0];
	const args = split[1];

    if(command=="echo"){
        return message.reply(args);
    }else if(command == "searchAll"){
      if(graph.detectCycle()){
        message.reply("A cycle has been found in the graph!");
        var output = "";
        console.log(graph.cycle);
        for(let i = 0; i<graph.cycle.length-1; i++){
          output+=(graph.cycle[i] + "->" + graph.cycle[i+1] + ": " + graph.edge_names.get(graph.cycle[i]).get(graph.cycle[i+1]) + "\n");
        }
        message.reply(output);
      }else{
        message.reply("no cycle exists at the moment")
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
              var output = "";
              console.log(graph.cycle);
              for(let i = 0; i<graph.cycle.length-1; i++){
                output+=(graph.cycle[i] + "->" + graph.cycle[i+1] + ": " + graph.edge_names.get(graph.cycle[i]).get(graph.cycle[i+1]) + "\n");
              }
              message.reply(output);
            }
            return;
        }
    }
    else if(command == "add"){
        if(split.length!=3) return message.reply("Incorrect Format. Please enter an input of the form '!add currentCRN targetCRN'")
        else{
            add(split[1], split[2], "<@" + message.author.id + ">");
            
            message.reply("Added CRN:" + split[1] + " to our servers\nInputted request for CRN:" + split[2]);
            let source = split[1];
            let target = split[2];
            if(graph.detectCycleWithEdge(target, [], {source:true}, [source])){
              message.reply("A cycle has been found using this edge!");
              var output = "";
              console.log(graph.cycle);
              for(let i = 0; i<graph.cycle.length-1; i++){
                output+=(graph.cycle[i] + "->" + graph.cycle[i+1] + ": " + graph.edge_names.get(graph.cycle[i]).get(graph.cycle[i+1]) + "\n");
              }
              message.reply(output);
            }
            return;
        }
    }else if (command == "help"){
        return message.reply("Available functions:\n!echo [message]: " + 
            "repeats message\n!add [CRNdrop] [CRNadd]: adds a registry in our graph connecting drop to add\n!help: returns help menu");
    }
    message.reply("that isn't a valid command probably");
    return;
});

function add(drop, target, username){
    graph.addVertex(drop);
    graph.addVertex(target);
    graph.addEdge(drop, target, username);
    //console.log(graph.nodes);
}



// client.on('interactionCreate', async interaction => {
// 	console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

//     if (!interaction.isCommand()) return;

// 	const { commandName } = interaction;

//     const command = client.commands.get(interaction.commandName);

// 	if (!command) return;

// 	try {
// 		await command.execute(interaction);
// 	} catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}
// });

client.login(token);