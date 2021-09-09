# waitlist-bot

Welcome to waitlist-bot! This bot is intended to help UIUC students get the courses that they want a little quicker than they would otherwise by taking into consideration which courses will open up once a user switches into their desired course, and then looking for cycles.

To add this bot to your server, use the following link: 

https://discord.com/oauth2/authorize?client_id=884634092719706153&scope=bot&code=JBcnxq1j25tC3HeBXm7zAJNAWTuckH&guild_id=783477278268588113&permissions=207872

The bot works by creating a directed graph based on user inputs. 
A user can contribute an edge to the graph by providing the CRN of a course/timeslot they are trying to get into as well as the CRN of a course/timeslot that they are currently registered in and plan to drop if they get their target course/timeslot. 

Waitlist-bot then utilizes a DFS to detect cycles, and notifies every user who has inputted an edge involved in the cycle with instructions on how to resolve the cycle. 

Assuming the notified users follow the instructions provided by waitlist-bot, each person in the cycle will be able to register for their desired course in exchange for dropping the course they offered to!

Command List:
    
    !add [CRNdrop] [CRNadd]: Adds edge connecting CRN to be dropped and target CRN to graph, and then queries for a cycle
    
    !getAllEdges: returns all edges associated with the calling user
    
    !query [CRNdrop] [CRNadd]: checks for a cycle including the given edge. Notifies all users with an associated edge in the cycle. 
    
    !queryAll: runs query on every entry associated with the calling user. 
    
    !remove [CRNdrop] [CRNadd]: Removes an edge connecting CRNdrop to CRNadd made by the calling user
    
    !removeUser: Removes all entries in database associated with the calling user
    
    !searchAll: searches entire database for a cycle and returns a cycle if found. 
    
    !help: returns help menu

This bot was built using node.js alongside the discord.js module. 
