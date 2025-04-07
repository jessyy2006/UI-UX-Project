// Function Declarations
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Slider
let sliderValues = [0.5, 0.5, 0.5, 0.5];
let dynamicSeed = getRandomInt(0, 100000);


document.addEventListener("DOMContentLoaded", function() {
    const sliders = document.querySelectorAll(".range-style");
    const executeBtn = document.getElementById("execBtn");

    sliderValues = [0.5, 0.5, 0.5, 0.5];

    // Initialize slider values array
    sliders.forEach((slider, index) => {
        sliderValues[index] = slider.value;
        
        if (sliderValues[index] == 50) {
            sliderValues[index] = 0.5;
        }
        // Update value when slider changes
        slider.addEventListener("input", function() {
            sliderValues[index] = ((this.value / 100) * 4) -2; // range of -2 to 2

            console.log(`Slider ${index + 1} value: ${this.value}`);
        });
    });

    // execute button click
    executeBtn.addEventListener("click", function() {
        // 1. Store references to the button and status text element
        const button = this;
        const statusText = document.querySelector('.exec-status-text');
    
        // 2. Clear any existing timeouts to prevent multiple animations
        if (window.statusTextTimeout) clearTimeout(window.statusTextTimeout);
        if (window.intermediateTimeout) clearTimeout(window.intermediateTimeout);
    
        // 3. Set initial visual states
        button.classList.add('loading'); // Visual effects
        button.disabled = true; // Prevent double-clicks
        statusText.style.display = 'block'; // Make text visible
        statusText.textContent = "PREPARING FOR LAUNCH"; // Initial message
        statusText.className = 'exec-status-text visible typewriter'; // Apply animations
    
        // 4. First text update after 5 seconds
        window.intermediateTimeout = setTimeout(() => {
            statusText.textContent = "GENERATING CONTENT";
            statusText.classList.remove('typewriter'); // Remove typing animation
        }, 5000);
    
        // 5. Final update after 20 seconds
        window.statusTextTimeout = setTimeout(() => {
            // Clear any pending intermediate update
            clearTimeout(window.intermediateTimeout);
            
            // Update to final message
            statusText.textContent = "PROCESS COMPLETE!";
            statusText.classList.remove('typewriter'); // Ensure no typing animation
            

            // After 2 more seconds, fade out and reset
            setTimeout(() => {
                statusText.classList.remove('visible'); // Start fade out
                setTimeout(() => {
                    statusText.style.display = 'none'; // Hide completely
                    button.classList.remove('loading', 'glitch-active');
                    button.disabled = false; // Re-enable button
                }, 500); // Wait for fade transition
            }, 2000); // Show "COMPLETE" for 2 seconds
        }, 15000);
        
        // debug:
        console.log("All slider values:", sliderValues);

        sendPrompt();
    });
});


// Wildcard selection
let chosen_value = "An arrangement of objects ";

document.querySelector('.wildcard-container').addEventListener('change', function(event) {
    if (event.target.type === 'radio' && event.target.checked) {
        const label = event.target.closest('label');
        chosen_value = event.target.value;
        dynamicSeed = label.id; 
        console.log("Selected:", {
            chosen_value: event.target.value
        });
    }

});

// Connect to ComfyUI
let dynamicPrompt = "";

function generatePrompt() {
    // add my slider inputs here
    // 3.1 Structured Prompt Writing Rules
    //     Subject
    //     Features
    //     Environment/Background
    //     Style
    //     Modifiers
    dynamicSeed = getRandomInt(0, 100000);
    dynamicPrompt =
        chosen_value + "with the following characteristics = (romantic:" + sliderValues[0] + ")" + ", (natural plants:" + sliderValues[1] + "), " + "(very sharp lines:" + sliderValues[2] + "), " + "(fun and chaotic:" + sliderValues[3] + ")";
    return dynamicPrompt;
}

async function sendPrompt() {
    dynamicPrompt = generatePrompt();
    console.log(dynamicPrompt);
    console.log("Seed value: " + dynamicSeed);

    
    const prompt = {
        3: {
            inputs: {
                seed: dynamicSeed, // UPDATE = NO MORE DYANMIC SEED? i just subbed w label of radio id but idk if that makes sense?
                steps: 20,
                cfg: 8,
                sampler_name: "euler",
                scheduler: "normal",
                denoise: 1,
                model: ["4", 0],
                positive: ["6", 0],
                negative: ["7", 0],
                latent_image: ["5", 0]
            },
            class_type: "KSampler",
            _meta: {
                title: "KSampler"
            }
        },
        4: {
            inputs: {
                ckpt_name: "juggernautXL_v9Rdphoto2Lightning.safetensors"
            },
            class_type: "CheckpointLoaderSimple",
            _meta: {
                title: "Load Checkpoint"
            }
        },
        5: {
            inputs: {
                width: 768,
                height: 512,
                batch_size: 1
            },
            class_type: "EmptyLatentImage",
            _meta: {
                title: "Empty Latent Image"
            }
        },
        6: {
            inputs: {
                text: dynamicPrompt,
                clip: ["4", 1]
            },
            class_type: "CLIPTextEncode",
            _meta: {
                title: "CLIP Text Encode (Prompt)"
            }
        },
        7: {
            inputs: {
                text: "",
                clip: ["4", 1]
            },
            class_type: "CLIPTextEncode",
            _meta: {
                title: "CLIP Text Encode (Prompt)"
            }
        },
        8: {
            inputs: {
                samples: ["3", 0],
                vae: ["4", 2]
            },
            class_type: "VAEDecode",
            _meta: {
                title: "VAE Decode"
            }
        },
        9: {
            inputs: {
                filename_prefix: "Dynamic_Prompt_",
                images: ["8", 0]
            },
            class_type: "SaveImage",
            _meta: {
                title: "Save Image"
            }
        }
    };

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: prompt })
    };

    try {
        const response = await fetch("http://127.0.0.1:8188/prompt", options); // Replace with your ComfyUI address/port if needed.
        const data = await response.json();
        console.log("ComfyUI response:", data);

        // Optionally, you can poll the history endpoint to get the image results
        const historyResponse = await fetch(`http://127.0.0.1:8188/history/${data.prompt_id}`);
        const historyData = await historyResponse.json();
        console.log("ComfyUI History:", historyData);
        // You'd need to parse the history data to display the image.
    } catch (error) {
        console.error("Error sending prompt:", error);
    }
}

