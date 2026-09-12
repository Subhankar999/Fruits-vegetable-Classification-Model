// =====================================================
// BACKEND URL
// =====================================================

const BACKEND_URL =
    "https://fruits-vegetable-classification-model.onrender.com/predict";


// =====================================================
// MAXIMUM FILE SIZE
// Example: 10 MB
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024;


// =====================================================
// ALLOWED IMAGE EXTENSIONS
// =====================================================

const ALLOWED_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tiff",
    ".tif"
];


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
// ERROR MESSAGE ELEMENT
// =====================================================

// If you already have an error element in HTML,
// this will use it.
//
// Example:
// <div id="fruitError"></div>

const fruitError =
    document.getElementById("fruitError");


// =====================================================
// SHOW ERROR ON WEBSITE
// =====================================================

function showError(message) {

    console.error("Error:", message);

    if (fruitError) {

        fruitError.textContent =
            `⚠️ ${message}`;

        fruitError.style.display =
            "block";

    } else {

        // Fallback if fruitError doesn't exist
        fruitResult.textContent =
            `⚠️ ${message}`;

    }

}


// =====================================================
// CLEAR ERROR
// =====================================================

function clearError() {

    if (fruitError) {

        fruitError.textContent = "";

        fruitError.style.display =
            "none";

    }

}


// =====================================================
// RESET RESULT
// =====================================================

function resetResult() {

    fruitResult.textContent =
        "Ready to predict";

    fruitConfidence.textContent =
        "0%";

    fruitProgress.style.width =
        "0%";

}


// =====================================================
// CHECK FILE EXTENSION
// =====================================================

function isAllowedFile(file) {

    const fileName =
        file.name.toLowerCase();

    return ALLOWED_EXTENSIONS.some(
        extension =>
            fileName.endsWith(extension)
    );

}


// =====================================================
// IMAGE PREVIEW
// =====================================================

fruitInput.addEventListener(
    "change",
    function () {

        clearError();

        const file =
            this.files[0];


        // ---------------------------------------------
        // No file
        // ---------------------------------------------

        if (!file) {

            fruitPredictBtn.disabled =
                true;

            resetResult();

            return;
        }


        // ---------------------------------------------
        // Check extension
        // ---------------------------------------------

        if (!isAllowedFile(file)) {

            showError(
                "Unsupported image format. Please upload JPG, JPEG, PNG, WEBP, BMP, TIFF or TIF."
            );

            fruitPredictBtn.disabled =
                true;

            this.value = "";

            return;
        }


        // ---------------------------------------------
        // Check file size
        // ---------------------------------------------

        if (file.size > MAX_FILE_SIZE) {

            showError(
                "Image is too large. Maximum allowed size is 10 MB."
            );

            fruitPredictBtn.disabled =
                true;

            this.value = "";

            return;
        }


        // ---------------------------------------------
        // Check actual MIME type
        // ---------------------------------------------

        if (
            !file.type.startsWith("image/")
        ) {

            showError(
                "The selected file is not a valid image."
            );

            fruitPredictBtn.disabled =
                true;

            this.value = "";

            return;
        }


        // ---------------------------------------------
        // Create preview
        // ---------------------------------------------

        const imageURL =
            URL.createObjectURL(file);

        fruitPreview.src =
            imageURL;

        fruitPreview.style.display =
            "block";

        fruitPlaceholder.style.display =
            "none";


        // ---------------------------------------------
        // Enable prediction
        // ---------------------------------------------

        fruitPredictBtn.disabled =
            false;


        // ---------------------------------------------
        // Reset result
        // ---------------------------------------------

        fruitResult.textContent =
            "Ready to predict";

        fruitConfidence.textContent =
            "0%";

        fruitProgress.style.width =
            "0%";

    }
);


// =====================================================
// FRUIT PREDICTION
// =====================================================

fruitPredictBtn.addEventListener(
    "click",
    async function () {

        clearError();

        const file =
            fruitInput.files[0];


        // =================================================
        // CHECK FILE
        // =================================================

        if (!file) {

            showError(
                "Please select a fruit or vegetable image first."
            );

            return;
        }


        // =================================================
        // CHECK EXTENSION
        // =================================================

        if (!isAllowedFile(file)) {

            showError(
                "Unsupported image format."
            );

            return;
        }


        // =================================================
        // CHECK FILE SIZE
        // =================================================

        if (file.size > MAX_FILE_SIZE) {

            showError(
                "Image is too large. Maximum allowed size is 10 MB."
            );

            return;
        }


        // =================================================
        // CHANGE UI
        // =================================================

        fruitPredictBtn.disabled =
            true;

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

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );


            // =================================================
            // CREATE ABORT CONTROLLER
            // =================================================

            const controller =
                new AbortController();


            // =================================================
            // TIMEOUT
            // 60 seconds
            // =================================================

            const timeout =
                setTimeout(
                    () => controller.abort(),
                    60000
                );


            let response;


            // =================================================
            // SEND REQUEST
            // =================================================

            try {

                response =
                    await fetch(
                        BACKEND_URL,
                        {
                            method: "POST",
                            body: formData,
                            signal: controller.signal
                        }
                    );

            } catch (networkError) {

                clearTimeout(timeout);

                // ---------------------------------------------
                // Timeout
                // ---------------------------------------------

                if (
                    networkError.name ===
                    "AbortError"
                ) {

                    throw new Error(
                        "The server took too long to respond. Please try again."
                    );

                }


                // ---------------------------------------------
                // Network error
                // ---------------------------------------------

                throw new Error(
                    "Unable to connect to the backend server. Please check your internet connection or try again later."
                );

            }


            clearTimeout(timeout);


            // =================================================
            // HTTP STATUS ERROR
            // =================================================

            if (!response.ok) {

                let errorMessage =
                    "";


                // ---------------------------------------------
                // Try to read backend JSON error
                // ---------------------------------------------

                try {

                    const errorData =
                        await response.json();

                    console.error(
                        "Backend error:",
                        errorData
                    );


                    if (
                        errorData.detail
                    ) {

                        if (
                            typeof errorData.detail ===
                            "string"
                        ) {

                            errorMessage =
                                errorData.detail;

                        } else {

                            errorMessage =
                                JSON.stringify(
                                    errorData.detail
                                );

                        }

                    }

                } catch (jsonError) {

                    // -----------------------------------------
                    // Backend did not return JSON
                    // -----------------------------------------

                    try {

                        errorMessage =
                            await response.text();

                    } catch {

                        errorMessage =
                            "";
                    }

                }


                // =================================================
                // DEFAULT HTTP ERROR MESSAGES
                // =================================================

                if (!errorMessage) {

                    switch (
                        response.status
                    ) {

                        case 400:

                            errorMessage =
                                "Bad request. Please upload a valid image.";

                            break;


                        case 404:

                            errorMessage =
                                "Prediction endpoint was not found.";

                            break;


                        case 413:

                            errorMessage =
                                "The uploaded image is too large.";

                            break;


                        case 422:

                            errorMessage =
                                "Invalid data was sent to the server.";

                            break;


                        case 500:

                            errorMessage =
                                "Internal server error. Please try again later.";

                            break;


                        case 502:

                            errorMessage =
                                "The backend server is temporarily unavailable.";

                            break;


                        case 503:

                            errorMessage =
                                "The prediction service is currently unavailable.";

                            break;


                        case 504:

                            errorMessage =
                                "The backend server took too long to respond.";

                            break;


                        default:

                            errorMessage =
                                `Server error (${response.status}). Please try again.`;

                    }

                }


                throw new Error(
                    errorMessage
                );

            }


            // =================================================
            // CONVERT RESPONSE TO JSON
            // =================================================

            let data;


            try {

                data =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "The server returned an invalid response."
                );

            }


            console.log(
                "Backend response:",
                data
            );


            // =================================================
            // CHECK BACKEND RESPONSE
            // =================================================

            if (!data) {

                throw new Error(
                    "Empty response received from the server."
                );

            }


            // =================================================
            // GET FRUIT NAME
            // =================================================

            const fruitName =
                data.Fruit;


            if (
                !fruitName ||
                typeof fruitName !== "string"
            ) {

                throw new Error(
                    "Fruit name was not received correctly from the server."
                );

            }


            // =================================================
            // GET CONFIDENCE
            // =================================================

            let confidence =
                data.Confidence;


            // Convert string to number
            //
            // Example:
            // "99.77%" → 99.77
            //

            if (
                typeof confidence ===
                "string"
            ) {

                confidence =
                    parseFloat(
                        confidence
                    );

            } else {

                confidence =
                    Number(
                        confidence
                    );

            }


            // =================================================
            // CHECK CONFIDENCE
            // =================================================

            if (
                Number.isNaN(
                    confidence
                )
            ) {

                throw new Error(
                    "The server returned an invalid confidence value."
                );

            }


            // =================================================
            // CHECK CONFIDENCE RANGE
            // =================================================

            if (
                confidence < 0 ||
                confidence > 100
            ) {

                throw new Error(
                    "The confidence value returned by the server is outside the valid range."
                );

            }


            // =================================================
            // SHOW RESULT
            // =================================================

            fruitResult.textContent =
                `Fruit: ${fruitName}`;


            fruitConfidence.textContent =
                `Confidence: ${confidence.toFixed(2)}%`;


            // =================================================
            // PROGRESS BAR
            // =================================================

            fruitProgress.style.width =
                `${confidence}%`;


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            clearError();


            console.log(
                "Prediction successful"
            );

            console.log(
                "Fruit:",
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


            // ---------------------------------------------
            // Show exact error on website
            // ---------------------------------------------

            showError(
                error.message ||
                "An unexpected error occurred."
            );


            // ---------------------------------------------
            // Reset prediction result
            // ---------------------------------------------

            fruitResult.textContent =
                "Prediction failed";

            fruitConfidence.textContent =
                "Confidence: 0%";

            fruitProgress.style.width =
                "0%";

        }


        // =================================================
        // ENABLE BUTTON AGAIN
        // =================================================

        fruitPredictBtn.disabled =
            false;

        fruitPredictBtn.textContent =
            "🔍 Predict Fruit";

    }
);
