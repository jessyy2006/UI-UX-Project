
// Slider
let sliderValues = [];

document.addEventListener("DOMContentLoaded", function() {
    const sliders = document.querySelectorAll(".range-style");
    const executeBtn = document.getElementById("execBtn");
    
    // Initialize slider values array
    sliders.forEach((slider, index) => {
        sliderValues[index] = slider.value;
        
        // Update value when slider changes
        slider.addEventListener("input", function() {
            sliderValues[index] = this.value;
            console.log(`Slider ${index + 1} value: ${this.value}`);
        });
    });

    // Handle execute button click
    executeBtn.addEventListener("click", function() {
        console.log("All slider values:", sliderValues);
        
        // Prepare the payload with all slider values
        const payload = {
            name: "Success",
            message: sliderValues.join(",") // Combine all values with commas
        };

        // Send data to mock API
        sendData(payload);
    });
});

// Connect to mock API
async function sendData(payload) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Mock API Response:', result);
        
        // Optional: Show success message to user
        alert("Data sent successfully! Check console for details.");
    } catch (error) {
        console.error('Error sending data:', error);
        alert("Error sending data. Please try again.");
    }
}