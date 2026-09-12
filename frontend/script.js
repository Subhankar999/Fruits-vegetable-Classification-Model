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
// VEGETABLE ELEMENTS
// =====================================================

const vegetableInput =
    document.getElementById("vegetableInput");

const vegetablePreview =
    document.getElementById("vegetablePreview");

const vegetablePlaceholder =
    document.getElementById("vegetablePlaceholder");

const vegetablePredictBtn =
    document.getElementById("vegetablePredictBtn");

const vegetableResult =
    document.getElementById("vegetableResult");

const vegetableConfidence =
    document.getElementById("vegetableConfidence");

const vegetableProgress =
    document.getElementById("vegetableProgress");


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


// =====================================================
// VEGETABLE IMAGE PREVIEW
// =====================================================

vegetableInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const imageURL =
        URL.createObjectURL(file);

    vegetablePreview.src =
        imageURL;

    vegetablePreview.style.display =
        "block";

    vegetablePlaceholder.style.display =
        "none";

    vegetablePredictBtn.disabled =
        false;

    vegetableResult.textContent =
        "Ready to predict";

    vegetableConfidence.textContent =
        "0%";

    vegetableProgress.style.width =
        "0%";
});


// =====================================================
// FRUIT PREDICTION
// =====================================================

fruitPredictBtn.addEventListener(
    "click",
    async function () {

        const file =
            fruitInput.files[0];

        if (!file) {
            alert("Please select a fruit image.");
            return;
        }

        fruitPredictBtn.disabled = true;

        fruitPredictBtn.textContent =
            "⏳ Analyzing...";

        fruitResult.textContent =
            "Analyzing image...";

        try {

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );


            const response =
                await fetch(
                    `${BACKEND_URL}`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Server returned an error"
                );

            }


            const data =
                await response.json();


            // Expected backend response:
            //
            // {
            //   "prediction": "Apple",
            //   "confidence": 96.42
            // }


            fruitResult.textContent =
                data.prediction;


            const confidence =
                Number(data.confidence);


            fruitConfidence.textContent =
                confidence.toFixed(2) + "%";


            fruitProgress.style.width =
                confidence + "%";


        } catch (error) {

            console.error(error);

            fruitResult.textContent =
                "Prediction failed";

            fruitConfidence.textContent =
                "0%";

            fruitProgress.style.width =
                "0%";

            alert(
                "Unable to connect to the prediction server."
            );

        }


        fruitPredictBtn.disabled = false;

        fruitPredictBtn.textContent =
            "🔍 Predict Fruit";

    }
);



