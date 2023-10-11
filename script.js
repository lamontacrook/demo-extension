const getVariables = () => {
    const variableList = document.querySelector('#global-variables');
    if(!chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab[0].id, allFrames: true },
                func: readVariables,
                args: [tab[0].id]
            }).then((injectionResults) => {
                for (const { frameId, result } of injectionResults) {
                    console.log(`Frame ${frameId}`);
                    result.forEach(element => {
                        const div = document.createElement('div');
                        div.classList.add('spectrum-Form-item');
                        div.innerHTML = `
                        <label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--left" for="fieldLabelExample-${element[0]}">${element[0]}</label>
                        <div class="spectrum-Form-itemField">
                            <div class="spectrum-Textfield">
                                <input class="spectrum-Textfield-input" aria-invalid="false" type="text" placeholder="${element[1]}" id="fieldLabelExample-${element[0]}">
                            </div>
                        </div>`;

                        div.querySelector('input').addEventListener('change', ((e) => {
                            chrome.scripting.insertCSS({
                                target: {
                                    tabId: tab[0].id,
                                },
                                css: `:root { ${element[0]}: ${e.target.value} !important; }`
                            });
                            console.log(`:root { ${element[0]}: ${e.target.value} !important; }`);
                        }));
                        variableList.append(div);
                    });

                }
            });
        }
    });
};

const getImages = () => {
    const variableList = document.querySelector('#global-variables');
    if(!chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab[0].id, allFrames: true },
                func: collectImages
            }).then((injectionResults) => {
                for (const { frameId, result } of injectionResults) {
                    console.log(`Frame ${frameId}`);
                    console.log(result);
                    // result.forEach(element => {
                       // console.log(element);
                        // const div = document.createElement('div');
                        // div.classList.add('spectrum-Form-item');
                        // div.innerHTML = `
                        // <label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--left" for="fieldLabelExample-${element[0]}">${element[0]}</label>
                        // <div class="spectrum-Form-itemField">
                        //     <div class="spectrum-Textfield">
                        //         <input class="spectrum-Textfield-input" aria-invalid="false" type="text" placeholder="${element[1]}" id="fieldLabelExample-${element[0]}">
                        //     </div>
                        // </div>`;

                        // div.querySelector('input').addEventListener('change', ((e) => {
                        //     chrome.scripting.insertCSS({
                        //         target: {
                        //             tabId: tab[0].id,
                        //         },
                        //         css: `:root { ${element[0]}: ${e.target.value} !important; }`
                        //     });
                        //     console.log(`:root { ${element[0]}: ${e.target.value} !important; }`);
                        // }));
                        // variableList.append(div);
                    // });

                }
            });
        }
    });
}

const toggleSelected = (e) => {
    const tabs = document.querySelector('.spectrum-Tabs');

    [...tabs.children].forEach((tab) => {
        if(tab.classList.contains('is-selected')) tab.classList.toggle('is-selected');
    });
    e.target.parentElement.classList.toggle('is-selected');
    const slider = document.querySelector('.spectrum-Tabs-selectionIndicator');
    const selected = document.querySelector('.is-selected');
    slider.style = `width: 28px; left: ${selected.offsetLeft}px;`;
};

addEventListener('DOMContentLoaded', ((e) => {
    getVariables();
    getImages();
}));

const collectImages = () => {
    return [...document.querySelectorAll('img')].map((img) => {
        return img.src;
    })
}

const readVariables = (tabId) => {
    const isSameDomain = (styleSheet) => {
        if (!styleSheet.href) {
            return true;
        }
        return styleSheet.href.indexOf(window.location.origin) === 0;
    };
    const isStyleRule = (rule) => rule.type === 1;
    const values = [...document.styleSheets].filter(isSameDomain).reduce(
        (finalArr, sheet) =>
            finalArr.concat(
                [...sheet.cssRules].filter(isStyleRule).reduce((propValArr, rule) => {
                    const props = [...rule.style].map((propName) => {
                        return [
                            propName.trim(),
                            rule.style.getPropertyValue(propName).trim()
                        ]
                    }).filter(([propName]) => propName.indexOf("--") === 0);
                    return [...propValArr, ...props];
                }, [])
            ),
        []
    );
    return values;
}