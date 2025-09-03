// sample.js

// Global variable (bad practice)
x = 42

function sayHello(name) {
    // Missing semicolon
    console.log("Hello, " + name)

    // == instead of === (type coercion)
    if (name == "Admin") {
        console.log("Welcome back, Admin!")
    }
    else {
        console.log("Access granted")
    }
}

// Unused variable
var unused = 123;

// Function declared but never used
function multiply(a, b) {
    return a * b
}

// Call without declaring the function first (hoisting issue in some linters)
sayGoodbye("John")

function sayGoodbye(name) {
    console.log("Goodbye, " + name)
}

// Trailing comma issue (older JS versions)
var numbers = [1, 2, 3, ]
