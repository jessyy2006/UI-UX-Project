// Slider
let sliderValues = [50, 50, 50, 50];

document.addEventListener("DOMContentLoaded", function() {
    const sliders = document.querySelectorAll(".range-style");
    const executeBtn = document.getElementById("execBtn");

    // Initialize slider values array
    sliders.forEach((slider, index) => {
        sliderValues[index] = slider.value;
        
        // Update value when slider changes
        slider.addEventListener("input", function() {
            sliderValues[index] = this.value / 100;
                // scale 1-100 down to 0.5-1.5 later: \(y=\frac{x}{99}+\frac{97}{198}\) 

            console.log(`Slider ${index + 1} value: ${this.value}`);
        });
    });

    // Handle execute button click
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

                    // 1. First make button fly up
                    button.style.transition = 'transform 5s ease-in-out';
                    button.style.transform = 'translateY(-100vh)';

                }, 500); // Wait for fade transition
            }, 2000); // Show "COMPLETE" for 2 seconds
        }, 20000);



        // ------------------------------------------
        // // Simulate backend call (NEED TO UPDATE)
        // fetch('/your-api-endpoint')
        // .then(response => response.json())
        // .then(data => {
        //     clearTimeout(firstChange); // Cancel intermediate text if still pending
            
        //     // Update text on completion
        //     statusText.textContent = "PROCESS COMPLETE!";
        //     statusText.classList.add('typewriter'); // Re-trigger animation
            
        //     // Set timeout to disappear after 20 seconds from click
        //     window.statusTextTimeout = setTimeout(() => {
        //     statusText.classList.remove('visible');
        //     setTimeout(() => {
        //         statusText.style.display = 'none';
        //         button.classList.remove('glitch-active', 'enlarged');
        //     }, 500); // Match transition duration
        //     }, 20000); // 20 seconds total
        // })
        // .catch(error => {
        //     statusText.textContent = "ERROR! RETRY?";
        //     button.classList.remove('glitch-active');
        //     // Still disappear after 20 seconds
        //     window.statusTextTimeout = setTimeout(() => {
        //     statusText.classList.remove('visible');
        //     setTimeout(() => statusText.style.display = 'none', 500);
        //     }, 20000);
        // });
        
        // debug:
        console.log("All slider values:", sliderValues);
        sendPrompt();

       

    });
});

// Wildcard selection
// MAKE WILDCARDS FUN
let wildcard1 = " glue,";
let wildcard2 = " soil,";
let wildcard3 = " fur,";
let wildcard4 = " miso,";
let wildcard5 = " leather,";
const wildcards = [wildcard1, wildcard2, wildcard3, wildcard4, wildcard5];
const dynamicSeed = 0;
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
    dynamicPrompt =
        "An arrangement of objects with" + sliderValues[0] + ")" + "(nature:" + sliderValues[1] + ")" + "(sharp edges:" + sliderValues[2] + ")" + "(chaos:" + sliderValues[3] + ")";
        wildcards[0]; // update so it's the one that's selected
    return dynamicPrompt;
}

async function sendPrompt() {
    dynamicPrompt = generatePrompt();
    console.log(dynamicSeed);
    console.log(dynamicPrompt + dynamicSeed);
    
    const prompt = {
        3: {
            inputs: {
                seed: dynamicSeed,
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