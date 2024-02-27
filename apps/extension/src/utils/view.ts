type InteractiveElement = {
    element: Element;
    clickable: boolean;
    area: number;
    rects: Array<{
        left: number;
        top: number;
        // right: number;
        // bottom: number;
        width: number;
        height: number;
    }>;
    tagName: string;
    text?: string;
}


function getInteractiveElementsFromWindow() {
    const clickableItems = Array.prototype.slice.call(document.querySelectorAll('*')).map(function (element) {
        // 获取视窗宽度和高度
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        // 确定元素是否可见且在视窗内
        const rects = [...element.getClientRects()].filter(bb => {
            const center_x = bb.left + bb.width / 2;
            const center_y = bb.top + bb.height / 2;
            const elAtCenter = document.elementFromPoint(center_x, center_y);
            return elAtCenter === element || element.contains(elAtCenter);
        }).map(bb => ({
            left: Math.max(0, bb.left),
            top: Math.max(0, bb.top),
            right: Math.min(vw, bb.right),
            bottom: Math.min(vh, bb.bottom),
            width: bb.right - bb.left,
            height: bb.bottom - bb.top
        }));

        // 计算元素的可见面积
        const area = rects.reduce((acc, rect) => acc + rect.width * rect.height, 0);

        // 判断元素是否符合可点击条件
        const isClickable =
            (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT") ||
            (element.tagName === "BUTTON" || element.tagName === "A" || element.onclick !== null || window.getComputedStyle(element).cursor == "pointer") ||
            (element.tagName === "IFRAME" || element.tagName === "VIDEO");

        return {
            element: element,
            clickable: isClickable && (area >= 20),
            area: area,
            rects: rects,
            tagName: element.tagName,
            text: element.textContent.trim().replace(/\s{2,}/g, ' ')
        };
    }).filter(item => item.clickable);

    // 过滤掉嵌套的可点击元素，只保留最内层的元素
    const filteredItems = clickableItems.filter(x => !clickableItems.some(y => x.element.contains(y.element) && x !== y));

    return filteredItems;
}

function unmarkPage() {
    const elements = document.querySelectorAll('.markPageHighlight');
    for (const element of elements) {
        document.body.removeChild(element);
    }
}


function markPage(uniqueCssSelector: string) {
    unmarkPage();

    // Function to generate random colors
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    let items: InteractiveElement[] = [];
    if (uniqueCssSelector) {
        console.log('uniqueCssSelector', uniqueCssSelector)
        // If a unique CSS selector is provided, find those elements
        document.querySelectorAll(uniqueCssSelector).forEach((element) => {
            const rect = element.getBoundingClientRect();
            // Adjust the rect to the viewport's coordinates
            const adjustedRect = {
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height
            };
            items.push({
                element,
                rects: [adjustedRect],
                clickable: true,
                area: adjustedRect.width * adjustedRect.height,
                tagName: element.tagName,
                text: (element?.textContent || '').trim().replace(/\s{2,}/g, ' ')
            });
        });
    } else {
        // Otherwise, use getInteractiveElementsFromWindow to find interactive elements
        items = getInteractiveElementsFromWindow();
    }

    // Marking logic applied to either selected elements or all interactive elements
    items.forEach(function (item, index) {
        item.rects.forEach((bbox) => {
            const newElement = document.createElement("div");
            const borderColor = getRandomColor();
            newElement.className = "markPageHighlight"; // Assign a fixed className to the new element
            newElement.style.outline = `2px dashed ${borderColor}`;
            newElement.style.position = "fixed";
            newElement.style.left = `${bbox.left}px`;
            newElement.style.top = `${bbox.top}px`;
            newElement.style.width = `${bbox.width}px`;
            newElement.style.height = `${bbox.height}px`;
            newElement.style.pointerEvents = "none";
            newElement.style.boxSizing = "border-box";
            newElement.style.zIndex = '2147483647';

            // Add a floating label at the corner
            const label = document.createElement("span");
            label.textContent = `${index}`;
            label.style.position = "absolute";
            label.style.top = "-19px";
            label.style.left = "0px";
            label.style.background = borderColor;
            label.style.color = "white";
            label.style.padding = "2px 4px";
            label.style.fontSize = "12px";
            label.style.borderRadius = "2px";
            newElement.appendChild(label);

            document.body.appendChild(newElement);
        });
    });
}

const getScrollableContainers = () => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const scrollableContainers: Element[] = [];
    const SCROLL_THRESHOLD = 10; // 可根据需要调整

    allElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        // 检查垂直和水平滚动的可能性
        const isScrollableY = (element.scrollHeight > element.clientHeight + SCROLL_THRESHOLD) &&
            (['auto', 'scroll'].includes(computedStyle.overflowY) ||
                (computedStyle.overflowY === 'hidden' && ['absolute', 'relative', 'fixed', 'sticky'].includes(computedStyle.position)));
        const isScrollableX = (element.scrollWidth > element.clientWidth + SCROLL_THRESHOLD) &&
            (['auto', 'scroll'].includes(computedStyle.overflowX) ||
                (computedStyle.overflowX === 'hidden' && ['absolute', 'relative', 'fixed', 'sticky'].includes(computedStyle.position)));

        if (isScrollableY || isScrollableX) {
            scrollableContainers.push(element);
        }
    });

    return scrollableContainers;
};

export {
    markPage,
    unmarkPage,
    getScrollableContainers,
    getInteractiveElementsFromWindow,
}