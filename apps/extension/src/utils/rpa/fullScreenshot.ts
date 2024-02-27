  // function max(nums) {
        //     return Math.max.apply(Math, nums.filter(function (x) { return x; }));
        // }
        // const MAX_PRIMARY_DIMENSION = 15000 * 2,
        //     MAX_SECONDARY_DIMENSION = 4000 * 2,
        //     MAX_AREA = MAX_PRIMARY_DIMENSION * MAX_SECONDARY_DIMENSION;

        // function _filterScreenshots(imgLeft, imgTop, imgWidth, imgHeight, screenshots) {
        //     // Filter down the screenshots to ones that match the location
        //     // of the given image.
        //     //
        //     var imgRight = imgLeft + imgWidth,
        //         imgBottom = imgTop + imgHeight;
        //     return screenshots.filter(function (screenshot) {
        //         return (imgLeft < screenshot.right &&
        //             imgRight > screenshot.left &&
        //             imgTop < screenshot.bottom &&
        //             imgBottom > screenshot.top);
        //     });
        // }


        // const pageData = {
        //     windowWidth: document.documentElement.scrollWidth,
        //     windowHeight: document.documentElement.scrollHeight,
        //     totalWidth: document.documentElement.scrollWidth, // 页面总宽度
        //     totalHeight: document.documentElement.scrollHeight, // 页面总高度
        // };

        // function _initScreenshots(totalWidth, totalHeight) {
        //     // Create and return an array of screenshot objects based
        //     // on the `totalWidth` and `totalHeight` of the final image.
        //     // We have to account for multiple canvases if too large,
        //     // because Chrome won't generate an image otherwise.
        //     //
        //     var badSize = (totalHeight > MAX_PRIMARY_DIMENSION ||
        //         totalWidth > MAX_PRIMARY_DIMENSION ||
        //         totalHeight * totalWidth > MAX_AREA),
        //         biggerWidth = totalWidth > totalHeight,
        //         maxWidth = (!badSize ? totalWidth :
        //             (biggerWidth ? MAX_PRIMARY_DIMENSION : MAX_SECONDARY_DIMENSION)),
        //         maxHeight = (!badSize ? totalHeight :
        //             (biggerWidth ? MAX_SECONDARY_DIMENSION : MAX_PRIMARY_DIMENSION)),
        //         numCols = Math.ceil(totalWidth / maxWidth),
        //         numRows = Math.ceil(totalHeight / maxHeight),
        //         row, col, canvas, left, top;

        //     var canvasIndex = 0;
        //     var result = [];

        //     for (row = 0; row < numRows; row++) {
        //         for (col = 0; col < numCols; col++) {
        //             canvas = document.createElement('canvas');
        //             canvas.width = (col == numCols - 1 ? totalWidth % maxWidth || maxWidth :
        //                 maxWidth);
        //             canvas.height = (row == numRows - 1 ? totalHeight % maxHeight || maxHeight :
        //                 maxHeight);

        //             left = col * maxWidth;
        //             top = row * maxHeight;

        //             result.push({
        //                 canvas: canvas,
        //                 ctx: canvas.getContext('2d'),
        //                 index: canvasIndex,
        //                 left: left,
        //                 right: left + canvas.width,
        //                 top: top,
        //                 bottom: top + canvas.height
        //             });

        //             canvasIndex++;
        //         }
        //     }

        //     return result;
        // }
        // let screenshots = _initScreenshots(pageData?.totalWidth, pageData?.totalHeight);


        // function getPositions(callback) {

        //     var body = document.body,
        //         originalBodyOverflowYStyle = body ? body.style.overflowY : '',
        //         originalX = window.scrollX,
        //         originalY = window.scrollY,
        //         originalOverflowStyle = document.documentElement.style.overflow;

        //     // try to make pages with bad scrolling work, e.g., ones with
        //     // `body { overflow-y: scroll; }` can break `window.scrollTo`
        //     if (body) {
        //         body.style.overflowY = 'visible';
        //     }

        //     var widths = [
        //         document.documentElement.clientWidth,
        //         body ? body.scrollWidth : 0,
        //         document.documentElement.scrollWidth,
        //         body ? body.offsetWidth : 0,
        //         document.documentElement.offsetWidth
        //     ],
        //         heights = [
        //             document.documentElement.clientHeight,
        //             body ? body.scrollHeight : 0,
        //             document.documentElement.scrollHeight,
        //             body ? body.offsetHeight : 0,
        //             document.documentElement.offsetHeight
        //             // (Array.prototype.slice.call(document.getElementsByTagName('*'), 0)
        //             //  .reduce(function(val, elt) {
        //             //      var h = elt.offsetHeight; return h > val ? h : val;
        //             //  }, 0))
        //         ],
        //         fullWidth = max(widths),
        //         fullHeight = max(heights),
        //         windowWidth = window.innerWidth,
        //         windowHeight = window.innerHeight,
        //         arrangements = [],
        //         // pad the vertical scrolling to try to deal with
        //         // sticky headers, 250 is an arbitrary size
        //         scrollPad = 200,
        //         yDelta = windowHeight - (windowHeight > scrollPad ? scrollPad : 0),
        //         xDelta = windowWidth,
        //         yPos = fullHeight - windowHeight,
        //         xPos,
        //         numArrangements;

        //     // During zooming, there can be weird off-by-1 types of things...
        //     if (fullWidth <= xDelta + 1) {
        //         fullWidth = xDelta;
        //     }

        //     // Disable all scrollbars. We'll restore the scrollbar state when we're done
        //     // taking the screenshots.
        //     document.documentElement.style.overflow = 'hidden';

        //     while (yPos > -yDelta) {
        //         xPos = 0;
        //         while (xPos < fullWidth) {
        //             arrangements.push([xPos, yPos]);
        //             xPos += xDelta;
        //         }
        //         yPos -= yDelta;
        //     }

        //     /** */
        //     console.log('fullHeight', fullHeight, 'fullWidth', fullWidth);
        //     console.log('windowWidth', windowWidth, 'windowHeight', windowHeight);
        //     console.log('xDelta', xDelta, 'yDelta', yDelta);
        //     var arText = [];
        //     arrangements.forEach(function (x) { arText.push('[' + x.join(',') + ']'); });
        //     console.log('arrangements', arText.join(', '));
        //     /**/

        //     numArrangements = arrangements.length;

        //     function cleanUp() {
        //         document.documentElement.style.overflow = originalOverflowStyle;
        //         if (body) {
        //             body.style.overflowY = originalBodyOverflowYStyle;
        //         }
        //         window.scrollTo(originalX, originalY);
        //     }

        //     function processArrangements() {
        //         if (!arrangements.length) {
        //             cleanUp();
        //             return;
        //         }

        //         var next = arrangements.shift(),
        //             x = next[0], y = next[1];

        //         window.scrollTo(x, y);

        //         var data = {
        //             msg: 'capture',
        //             x: window.scrollX,
        //             y: window.scrollY,
        //             complete: (numArrangements - arrangements.length) / numArrangements,
        //             windowWidth: windowWidth,
        //             totalWidth: fullWidth,
        //             totalHeight: fullHeight,
        //             devicePixelRatio: window.devicePixelRatio
        //         };

        //         // console.log('>> DATA', JSON.stringify(data, null, 4));

        //         // Need to wait for things to settle
        //         window.setTimeout(function () {
        //             // In case the below callback never returns, cleanup
        //             var cleanUpTimeout = window.setTimeout(cleanUp, 1250);
        //             callback(data, function (captured) {
        //                 window.clearTimeout(cleanUpTimeout);
        //                 if (captured) {
        //                     // Move on to capture next arrangement.
        //                     processArrangements();
        //                 } else {
        //                     // If there's an error in popup.js, the response value can be
        //                     // undefined, so cleanup
        //                     cleanUp();
        //                 }
        //             })

        //         }, 150);
        //     };
        //     processArrangements()
        // }

        // getPositions(async (data) => {
        //     const dataURI = await sendToBackground({
        //         name: 'opengpts',
        //         windowId: windowId,
        //         body: {
        //             type: 'GET_SCREENSHOT',
        //         },
        //     })
        //     var image = new Image();
        //     image.onload = function () {
        //         data.image = { width: image.width, height: image.height };
        //         if (data.windowWidth !== image.width) {
        //             var scale = image.width / data.windowWidth;
        //             data.x *= scale;
        //             data.y *= scale;
        //             data.totalWidth *= scale;
        //             data.totalHeight *= scale;
        //         }

        //         _filterScreenshots(
        //             data.x, data.y, image.width, image.height, screenshots
        //         ).forEach(function (screenshot) {
        //             screenshot.ctx.drawImage(
        //                 image,
        //                 data.x - screenshot.left,
        //                 data.y - screenshot.top
        //             );
        //         });
        //     }
        //     image.src = dataURI;

        // });