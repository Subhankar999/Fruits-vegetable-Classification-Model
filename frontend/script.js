// =====================================================
// BACKEND URL
// =====================================================

const BACKEND_URL =
    "https://fruits-vegetable-classification-model.onrender.com";


// =====================================================
// FRUIT ELEMENTS
// =====================================================

const fruitInput =
    document.getElementById("fruitInput");

const fruitPreview =
    document.getElementById("fruitPreview");

const fruitPlaceholder =
    document.getElementById("fruitPlaceholder");

const fruitPredictBtn =
    document.getElementById("fruitPredictBtn");

const fruitResult =
    document.getElementById("fruitResult");

const fruitConfidence =
    document.getElementById("fruitConfidence");

const fruitProgress =
    document.getElementById("fruitProgress");





// =====================================================
// FRUIT IMAGE PREVIEW
// =====================================================

fruitInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const imageURL =
        URL.createObjectURL(file);

    fruitPreview.src = imageURL;

    fruitPreview.style.display = "block";

    fruitPlaceholder.style.display = "none";

    fruitPredictBtn.disabled = false;

    fruitResult.textContent =
        "Ready to predict";

    fruitConfidence.textContent =
        "0%";

    fruitProgress.style.width =
        "0%";
});










// FRUIT PREDICTION
// =====================================================

fruitPredictBtn.addEventListener("click", async function () {

    const file = fruitInput.files[0];

    if (!file) {
        alert("Please select a fruit image.");
        return;
    }

    fruitPredictBtn.disabled = true;
    fruitPredictBtn.textContent = "⏳ Analyzing...";
    fruitResult.textContent = "Analyzing image...";
    fruitConfidence.textContent = "Calculating...";
    fruitProgress.style.width = "0%";

    try {

        // Create form data
        const formData = new FormData();

        formData.append("file", file);


        // Send image to FastAPI
        const response = await fetch(
            `${BACKEND_URL}/predict`,
            {
                method: "POST",
                body: formData
            }
        );


        // Check server response
        if (!response.ok) {

            const errorText = await response.text();

            console.error("Server error:", errorText);

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        // Convert response to JSON
        const data = await response.json();

        console.log("Backend response:", data);


        // Get fruit name
        const fruitName = data.prediction;


        // Get confidence
        const confidence = Number(data.confidence);


        // Check confidence
        if (isNaN(confidence)) {

            throw new Error(
                "Confidence value received from backend is not a number."
            );
        }


        // =================================================
        // SHOW RESULT
        // =================================================

        fruitResult.textContent =
            `Fruit: ${fruitName}`;


        fruitConfidence.textContent =
            `Confidence: ${confidence.toFixed(2)}%`;


        fruitProgress.style.width =
            `${Math.min(Math.max(confidence, 0), 100)}%`;


    } catch (error) {

        console.error("Prediction error:", error);

        fruitResult.textContent =
            "Prediction failed";

        fruitConfidence.textContent =
            "Confidence: 0%";

        fruitProgress.style.width =
            "0%";

        alert(
            "Unable to get prediction from the server."
        );

    }


    // Enable button again
    fruitPredictBtn.disabled = false;

    fruitPredictBtn.textContent =
        "🔍 Predict Fruit";

});
