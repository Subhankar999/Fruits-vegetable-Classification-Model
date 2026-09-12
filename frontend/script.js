const BACKEND_URL =
    "https://fruits-vegetable-classification-model.onrender.com/predict";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tiff",
    ".tif"
];

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

const fruitError =
    document.getElementById("fruitError");

function showError(message) {

    console.error("Error:", message);

    if (fruitError) {

        fruitError.textContent =
            `⚠️ ${message}`;

        fruitError.style.display =
            "block";

    } else {
        fruitResult.textContent =
            `⚠️ ${message}`;

    }

}

function clearError() {

    if (fruitError) {

        fruitError.textContent = "";

        fruitError.style.display =
            "none";

    }

}

function resetResult() {

    fruitResult.textContent =
        "Ready to predict";

    fruitConfidence.textContent =
        "0%";

    fruitProgress.style.width =
        "0%";

}

function isAllowedFile(file) {

    const fileName =
        file.name.toLowerCase();

    return ALLOWED_EXTENSIONS.some(
        extension =>
            fileName.endsWith(extension)
    );

}

fruitInput.addEventListener(
    "change",
    function () {

        clearError();

        const file =
            this.files[0];

        if (!file) {

            fruitPredictBtn.disabled =
                true;

            resetResult();

            return;
        }

        if (!isAllowedFile(file)) {

            showError(
                "Unsupported image format. Please upload JPG, JPEG, PNG, WEBP, BMP, TIFF or TIF."
            );

            fruitPredictBtn.disabled =
                true;

            this.value = "";

            return;
        }

        if (file.size > MAX_FILE_SIZE) {

            showError(
                "Image is too large. Maximum allowed size is 10 MB."
            );

            fruitPredictBtn.disabled =
                true;

            this.value = "";

            return;
        }

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

        const imageURL =
            URL.createObjectURL(file);

        fruitPreview.src =
            imageURL;

        fruitPreview.style.display =
            "block";

        fruitPlaceholder.style.display =
            "none";

        fruitPredictBtn.disabled =
            false;

        fruitResult.textContent =
            "Ready to predict";

        fruitConfidence.textContent =
            "0%";

        fruitProgress.style.width =
            "0%";

    }
);

fruitPredictBtn.addEventListener(
    "click",
    async function () {

        clearError();

        const file =
            fruitInput.files[0];

        if (!file) {

            showError(
                "Please select a fruit or vegetable image first."
            );

            return;
        }

        if (!isAllowedFile(file)) {

            showError(
                "Unsupported image format."
            );

            return;
        }

        if (file.size > MAX_FILE_SIZE) {

            showError(
                "Image is too large. Maximum allowed size is 10 MB."
            );

            return;
        }

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

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () => controller.abort(),
                    60000
                );

            let response;

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

                if (
                    networkError.name ===
                    "AbortError"
                ) {

                    throw new Error(
                        "The server took too long to respond. Please try again."
                    );

                }

                throw new Error(
                    "Unable to connect to the backend server. Please check your internet connection or try again later."
                );

            }

            clearTimeout(timeout);

            if (!response.ok) {

                let errorMessage =
                    "";

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

                    try {

                        errorMessage =
                            await response.text();

                    } catch {

                        errorMessage =
                            "";
                    }

                }

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

            if (!data) {

                throw new Error(
                    "Empty response received from the server."
                );

            }

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

            let confidence =
                data.Confidence;

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

            if (
                Number.isNaN(
                    confidence
                )
            ) {

                throw new Error(
                    "The server returned an invalid confidence value."
                );

            }

            if (
                confidence < 0 ||
                confidence > 100
            ) {

                throw new Error(
                    "The confidence value returned by the server is outside the valid range."
                );

            }

            fruitResult.textContent =
                `${fruitName}`;

            fruitConfidence.textContent =
                `Confidence: ${confidence.toFixed(2)}%`;

            fruitProgress.style.width =
                `${confidence}%`;

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

        catch (error) {

            console.error(
                "Prediction error:",
                error
            );

            showError(
                error.message ||
                "An unexpected error occurred."
            );

            fruitResult.textContent =
                "Prediction failed";

            fruitConfidence.textContent =
                "Confidence: 0%";

            fruitProgress.style.width =
                "0%";

        }

        fruitPredictBtn.disabled =
            false;

        fruitPredictBtn.textContent =
            "🔍 Predict Fruit";

    }
);
