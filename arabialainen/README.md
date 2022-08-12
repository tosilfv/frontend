# Arabialainen Card Game
You will find the game instructions in the help folder in Finnish.

## Background
I decided to start making this project without TDD as I haven't got the skills to do that yet.
I also did not want to create a block diagram of the program before I began coding for the same reason.
I did make this game as my first own project in 2019 in Java language, so I had some preconceptions of how the game would look like. So I didn't feel the need to draw a layout of the frontend on paper with pencil. The Java code was not releasable spaghetti code and I've never published it. I wanted to make the same game in React because I needed something simple for my CV.
I used to play this game IRL for probably hundreds of times when I was a kid with real playing cards. I've always enjoyed it and I think this could be the best two player card game I have ever played. I hope you have a lot of fun playing it too!
Big thanks goes to Colt Steele, whose React course on Udemy had a card game example, which I used as a starter code for this project.

## Design decisions
This project uses the Deck of Cards API from https://deckofcardsapi.com/
The folder and file structure has been created with expandability in mind.
Basically all central files are in the game\arabialainen folder. The game is written using Class components (Old React).

## Known errors
E1. When player repeatedly clicks own cards, axios errors appear.
E2. When player hits a card from hand, there is approximately a 500[ms] - 1500[ms] delay before the card shows up on table.