import type { PlasmoCSConfig } from "plasmo";
import {   testElementScrollability } from "~src/utils/rpa";
import { getInteractiveElementsFromWindow, getScrollableContainers, markPage, unmarkPage } from '~src/utils/view';
// @ts-ignore
import uniqueSelector from 'unique-selector';
import * as rrweb from 'rrweb'
import * as rrwebSnapshot from 'rrweb-snapshot';
import { Mirror } from "rrweb-snapshot";

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    all_frames: false,
    world: 'MAIN'
}



let events = [];


// rrweb.record({
//     emit(event) {
//         // push event into the events array
//         events.push(event);
//     },
//     sampling: {
//         input: 'last',
//         mousemove: false
//     },
//     slimDOMOptions: {
//         comment: false,
//         script: false,
//         headFavicon: false,
//         headWhitespace: false,
//         headMetaDescKeywords: false,
//         headMetaSocial: false,
//         headMetaRobots: false,
//         headMetaHttpEquiv: false,
//         headMetaAuthorship: false,
//         headMetaVerification: false,
//     },
//     // plugins: [rrweb.getRecordConsolePlugin()],
// });



// this function will send events to the backend and reset the events array
// function save() {
//     const body = JSON.stringify({ events });
//     console.log('保存的快照活动', events)
//     events = [];

// }

// () => {
//     const snapshot = rrwebSnapshot.snapshot(document, {
//         blockClass: 'blockblock',
//         blockSelector: null,
//         maskTextClass: 'maskmask',
//         maskTextSelector: null,
//         inlineStylesheet: true,
//         maskTextFn: undefined,
//         maskInputFn: undefined,
//     });

//     console.log('snapshot', snapshot)
// }

// setInterval(save, 1 * 1000);

// const el = document.querySelector('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div')
// const res = rrwebSnapshot.serializeNodeWithId(el!, {
//     doc: document,
//     mirror: new Mirror(),
//     blockClass: 'blockblock',
//     blockSelector: null,
//     maskTextClass: 'maskmask',
//     maskTextSelector: null,
//     skipChild: false,
//     inlineStylesheet: true,
//     maskTextFn: undefined,
//     maskInputFn: undefined,
//     slimDOMOptions: {},
// });

// const rebuildNode = rrwebSnapshot.buildNodeWithSN(res!, {
//     doc: document,
//     mirror: new Mirror(),
//     skipChild: false,
//     hackCss: true,
//     afterAppend: (n: Node, id: number) => {
//         console.log('afterAppend', n, id)
//     },
//     cache: rrwebSnapshot.createCache()

// })
// console.log('rebuildNode', rebuildNode)

// rrwebSnapshot.rebuild

// console.log('res', res)


window['markPage'] = markPage
window['unmarkPage'] = unmarkPage
window['uniqueSelector'] = uniqueSelector
window['getInteractiveElementsFromWindow'] = getInteractiveElementsFromWindow
window['getScrollableContainers'] = getScrollableContainers
// window['serializeNodeWithId'] = rrwebSnapshot.serializeNodeWithId;
window['testElementScrollability'] = testElementScrollability