/**
 * Převodník z hexadecimálního formátu do RGB
 * @param {str} hex - Hexadecimální barva
 * @returns {{red: number, green: number, blue: number}} Barevné zastoupení RGB
 */
function hex2RGB(hex) {
    const red = parseInt(hex.slice(1, 3), 16) / 255;
    const green = parseInt(hex.slice(3, 5), 16) / 255;
    const blue = parseInt(hex.slice(5, 7), 16) / 255;

    return { red, green, blue }
}
/**
 * Funkce k oříznutí vyklíčované části obrazu
 * @param {ImageData} imgData - Datový popis obrazu
 */
function chromaKeying(imgData) {
    const tolerance = Number(document.getElementById("chroma_range").value); //Tolerance získaná z input range
    const chroma = hex2RGB(document.getElementById("chroma_key").value); // Klíčovaná barva získazná z input color
    const data = imgData.data;

    for (var i = 0; i < data.length; i += 4) {
        var red = data[i] / 255;
        var green = data[i + 1] / 255;
        var blue = data[i + 2] / 255;
        var diffR = Math.abs(red - chroma.red);
        var diffG = Math.abs(green - chroma.green);
        var diffB = + Math.abs(blue - chroma.blue)
        if (diffR < tolerance && diffG < tolerance && diffB < tolerance) {
            data[i + 3] = 0;
        }
    }
};

/**
 * Převedení obrazu do šedotónové stupnice
 * @param {ImageData} imgData - Datový popis obrazu
 */
function grayscale(imgData) {
    var data = imgData.data;
    for (var i = 0; i < data.length; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];

        const avg = (red + green + blue) / 3;

        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
};


/**
 * Callback starající se o načtení obrazu
 * @param {file} item - Načtené soubory
 * @param {string} elementName - ID elementu
 */
function handleFileSelect(item, elementName) {
    var files = item.files;

    console.log(files);

    for (var i = 0; i < files.length; i++) {
        console.log(files[i], files[i].name, files[i].size, files[i].type);

        // Only process image files.
        if (!files[i].type.match('image.*')) {
            continue;
        }

        var reader = new FileReader();

        // Closure for loading image to memory
        reader.onload = (function (file) {
            return function (evt) {
                var srcImg = new Image();
                srcImg.src = evt.target.result;

                srcImg.onload = function () {
                    var srcCanvas = document.getElementById(elementName);
                    var srcContext = srcCanvas.getContext("2d");

                    // Change size of canvas
                    srcCanvas.height = srcImg.height;
                    srcCanvas.width = srcImg.width;

                    srcContext.drawImage(srcImg, 0, 0);

                    var dstCanvas = document.getElementById("result");
                    dstCanvas.height = srcImg.height;
                    dstCanvas.width = srcImg.width;

                    var convertButton = document.getElementById("convert");
                    // Enabled button
                    convertButton.disabled = false;
                    // Add callback
                    convertButton.addEventListener('click', convertImage, false);
                    // convertImage();
                }
            }
        })(files[i]);

        reader.readAsDataURL(files[i]);

        break;
    };
};


// Callback function called, when clicked at Convert button
function convertImage() {
    var personCanvas = document.getElementById("person");
    var personContext = personCanvas.getContext("2d");
    var canvasHeight = personCanvas.height;
    var canvasWidth = personCanvas.width;
    personContext.alpha = 1;

    var personImageData = personContext.getImageData(0, 0, canvasWidth, canvasHeight);
    chromaKeying(personImageData);
    var backgroundImageData = document.getElementById("background").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var logoImageData = document.getElementById("logo").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    grayscale(logoImageData);
    var resultImageData = document.getElementById("result").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);

    const tolerance = Number(document.getElementById("chroma_range").value);
    document.getElementById("chroma_range_value").textContent = tolerance;

    convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData);

    document.getElementById("result").getContext("2d").putImageData(resultImageData, 0, 0);
};

// Function for converting raw data of image
function convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData) {
    var personData = personImageData.data;
    var backgroundData = backgroundImageData.data;
    var logoData = logoImageData.data;
    var resultData = resultImageData.data;

    // Go through the image using x,y coordinates
    var red, green, blue, alpha;
    for (var pixelIndex = 0; pixelIndex < personData.length; pixelIndex += 4) {
        //Vykreslení osoby, bez vyklíčovaného pozadí
        if (personData[pixelIndex + 3] != 0) {
            red = personData[pixelIndex + 0];
            green = personData[pixelIndex + 1];
            blue = personData[pixelIndex + 2];
            alpha = personData[pixelIndex + 3];
        //Vykreslení loga
        } else if (logoData[pixelIndex + 3] != 0) {
            red = logoData[pixelIndex + 0];
            green = logoData[pixelIndex + 1];
            blue = logoData[pixelIndex + 2];
            alpha = logoData[pixelIndex + 3];
        } else {
            red = (backgroundData[pixelIndex + 0] + logoData[pixelIndex + 0]) / 2;
            green = (backgroundData[pixelIndex + 1] + logoData[pixelIndex + 1]) / 2;
            blue = (backgroundData[pixelIndex + 2] + logoData[pixelIndex + 2]) / 2;
            alpha = (backgroundData[pixelIndex + 3] + logoData[pixelIndex + 3]) / 2;
        }

        resultData[pixelIndex + 0] = red;
        resultData[pixelIndex + 1] = green;
        resultData[pixelIndex + 2] = blue;
        resultData[pixelIndex + 3] = alpha;
    }

}