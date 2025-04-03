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
            sliderValues[index] = this.value / 100;
                // scale 1-100 down to 0.5-1.5 later: \(y=\frac{x}{99}+\frac{97}{198}\) 

            console.log(`Slider ${index + 1} value: ${this.value}`);
        });
    });

    // Handle execute button click
    executeBtn.addEventListener("click", function() {
        console.log("All slider values:", sliderValues);
        generatePrompt();
        sendPrompt();

    });
});


// Connect to ComfyUI
// MAKE WILDCARDS FUN
let wildcard1 = " glue,";
let wildcard2 = " soil,";
let wildcard3 = " fur,";
let wildcard4 = " miso,";
let wildcard5 = " leather,";
const wildcards = [wildcard1, wildcard2, wildcard3, wildcard4, wildcard5];
let dynamicPrompt = "";
let dynamicSeed = 1;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
        wildcards[getRandomInt(0, 4)];
    return dynamicPrompt;
}

async function sendPrompt() {
    
    dynamicSeed = getRandomInt(1, 100000);
    
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