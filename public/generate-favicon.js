// This script generates a favicon with "FC" in green
// Run with Node.js to generate the favicon

const fs = require("fs")
const { createCanvas } = require("canvas")

// Create a 32x32 canvas
const canvas = createCanvas(32, 32)
const ctx = canvas.getContext("2d")

// Fill background
ctx.fillStyle = "white"
ctx.fillRect(0, 0, 32, 32)

// Add text
ctx.fillStyle = "#16a34a" // Green color
ctx.font = "bold 18px Arial"
ctx.textAlign = "center"
ctx.textBaseline = "middle"
ctx.fillText("FC", 16, 16)

// Convert to PNG buffer
const buffer = canvas.toBuffer("image/png")

// Save to file
fs.writeFileSync("public/fc-favicon.png", buffer)

console.log("Favicon generated successfully!")
