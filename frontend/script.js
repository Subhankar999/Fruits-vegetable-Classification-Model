// =====================================================
// BACKEND URL
// =====================================================

const BACKEND_URL =
    "https://fruits-vegetable-classification-model.onrender.com/predict";


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

    // Create image preview URL
    const imageURL =
        URL.createObjectURL(file);

    fruitPreview.src = imageURL;

    fruitPreview.style.display = "block";

    fruitPlaceholder.style.display = "none";

    // Enable prediction button
    fruitPredictBtn.disabled = false;

    // Reset previous result
    fruitResult.textContent =
        "Ready to predict";

    fruitConfidence.textContent =
        "0%";

    fruitProgress.style.width =
        "0%";
});


// =====================================================
// FRUIT PREDICTION
// =====================================================

fruitPredictBtn.addEventListener("click", async function () {

    const file = fruitInput.files[0];

    // Check if image is selected
    if (!file) {

        alert("Please select a fruit image.");

        return;
    }


    // =================================================
    // CHANGE BUTTON / RESULT STATUS
    // =================================================

    fruitPredictBtn.disabled = true;

    fruitPredictBtn.textContent =
        "⏳ Analyzing...";

    fruitResult.textContent =
        "Analyzing image...";

    fruitConfidence.textContent =
        "Calculating...";

    fruitProgress.style.width =
        "0%";


    try {

        // =================================================
        // CREATE FORM DATA
        // =================================================

        const formData = new FormData();

        formData.append("file", file);


        // =================================================
        // SEND IMAGE TO FASTAPI BACKEND
        // =================================================

        const response = await fetch(
            BACKEND_URL,
            {
                method: "POST",
                body: formData
            }
        );


        // =================================================
        // CHECK SERVER RESPONSE
        // =================================================

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Server error:",
                errorText
            );

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        // =================================================
        // CONVERT RESPONSE TO JSON
        // =================================================

        const data =
            await response.json();

        console.log(
            "Backend response:",
            data
        );


        // =================================================
        // GET FRUIT NAME
        // =================================================

        const fruitName =
            data.Fruit;


        // Check if fruit name exists
        if (!fruitName) {

            throw new Error(
                "Fruit name was not received from backend."
            );
        }


        // =================================================
        // GET CONFIDENCE
        // =================================================

        let confidence =
            data.Confidence;


        // Convert confidence to number
        // Works for both:
        //
        // 99.77
        //
        // and
        //
        // "99.77%"
        //

        if (typeof confidence === "string") {

            confidence =
                parseFloat(confidence);

        } else {

            confidence =
                Number(confidence);

        }


        // Check confidence value
        if (Number.isNaN(confidence)) {

            throw new Error(
                "Confidence value received from backend is not a number."
            );
        }


        // =================================================
        // KEEP CONFIDENCE BETWEEN 0 AND 100
        // =================================================

        confidence =
            Math.min(
                Math.max(confidence, 0),
                100
            );


        // =================================================
        // SHOW FRUIT RESULT
        // =================================================

        fruitResult.textContent =
            `${fruitName}`;


        // =================================================
        // SHOW CONFIDENCE
        // =================================================

        fruitConfidence.textContent =
            `Confidence: ${confidence.toFixed(2)}%`;


        // =================================================
        // UPDATE PROGRESS BAR
        // =================================================

        fruitProgress.style.width =
            `${confidence}%`;


        // =================================================
        // CONSOLE OUTPUT
        // =================================================

        console.log(
            "Predicted Fruit:",
            fruitName
        );

        console.log(
            "Confidence:",
            confidence
        );

    }


    // =================================================
    // ERROR HANDLING
    // =================================================

    catch (error) {

        console.error(
            "Prediction error:",
            error
        );


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


    // =================================================
    // ENABLE BUTTON AGAIN
    // =================================================

    fruitPredictBtn.disabled = false;

    fruitPredictBtn.textContent =
        "🔍 Predict Fruit";

});
