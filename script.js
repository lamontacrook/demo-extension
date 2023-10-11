const getVariables = () => {
    const variableList = document.querySelector('#global-variables > form');
    if (!chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab[0].id, allFrames: true },
                func: readVariables,
                args: [tab[0].id]
            }).then((injectionResults) => {
                for (const { frameId, result } of injectionResults) {
                    console.log(`Frame ${frameId}`);
                    result && result.forEach(element => {
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
    const images = document.querySelector('#images');
    if (!chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab[0].id, allFrames: true },
                func: collectImages
            }).then((injectionResults) => {
                for (const { frameId, result } of injectionResults) {
                    result && result.forEach(element => {
                        const div = document.createElement('div');
                        div.classList.add('spectrum-AssetCard-assetContainer');

                        images.innerHTML += `<div style="width: 300px; height: 224px;">
                        <div class="spectrum-Card spectrum-Card--gallery" tabindex="0" role="figure" style="width: 532px;">
                          <div class="spectrum-Card-preview">
                            <div class="spectrum-Asset">
                              <img class="spectrum-Asset-image"
                                src="${element?.src}" />
                            </div>
                          </div>
                          <hr class="spectrum-Divider spectrum-Divider--sizeS spectrum-Card-divider">
                          <div class="spectrum-Card-body">
                            <div class="spectrum-Card-header">
                              <div class="spectrum-Card-title spectrum-Heading spectrum-Heading--sizeXS">${element?.alt}</div>
                              <div class="spectrum-Card-subtitle spectrum-Detail spectrum-Detail--sizeS">${element?.ext}</div>
                              <div class="spectrum-Card-description">${element?.pathname}</div>
                              <div class="spectrum-Card-actionButton">
                                <div style="display: inline-block;">
                                  <button aria-haspopup="true" class="spectrum-ActionButton spectrum-ActionButton--quiet">
                                    <svg class="spectrum-Icon spectrum-Icon--sizeM" focusable="false" aria-hidden="true">
                                      <use xlink:href="#spectrum-icon-18-More" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="spectrum-QuickActions spectrum-Card-quickActions">
                            <div class="spectrum-Checkbox spectrum-Checkbox--sizeM">
                              <input type="checkbox" class="spectrum-Checkbox-input" title="Select" value="">
                              <span class="spectrum-Checkbox-box">
                                <svg class="spectrum-Icon spectrum-UIIcon-Checkmark100 spectrum-Checkbox-checkmark" focusable="false"
                                  aria-hidden="true">
                                  <use xlink:href="#spectrum-css-icon-Checkmark100" />
                                </svg>
                                <svg class="spectrum-Icon spectrum-UIIcon-Dash100 spectrum-Checkbox-partialCheckmark" focusable="false"
                                  aria-hidden="true">
                                  <use xlink:href="#spectrum-css-icon-Dash100" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>`;

                        // div.querySelector('input').addEventListener('change', ((e) => {
                        //     chrome.scripting.insertCSS({
                        //         target: {
                        //             tabId: tab[0].id,
                        //         },
                        //         css: `:root { ${element[0]}: ${e.target.value} !important; }`
                        //     });
                        //     console.log(`:root { ${element[0]}: ${e.target.value} !important; }`);
                        // }));
                        // images.append(div);
                    });

                }
            });
        }
    });
}

const toggleSelected = (e) => {
    const tabs = document.querySelector('.spectrum-Tabs');

    [...tabs.children].forEach((tab) => {
        if (tab.classList.contains('is-selected')) tab.classList.toggle('is-selected');
    });
    const anchor = e.target.parentElement;
    anchor.classList.toggle('is-selected');

    const slider = document.querySelector('.spectrum-Tabs-selectionIndicator');
    const selected = document.querySelector('.is-selected');
    slider.style = `width: 28px; left: ${selected.offsetLeft}px;`;

    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach((item) => {
        if (!item.classList.contains('hidden')) item.classList.toggle('hidden');
    });

    const ti = anchor.href.split('#')[1];
    document.querySelector(`#${ti}`).classList.toggle('hidden');
};

addEventListener('DOMContentLoaded', ((e) => {
    getVariables();
    getImages();

    const tabs = document.querySelectorAll('.spectrum-Tabs-item');
    tabs.forEach((tab) => {
        tab.addEventListener('click', ((e) => {
            toggleSelected(e);
        }))
    });
}));



const collectImages = () => {
    return [...document.querySelectorAll('img')].map((img) => {
        const url = new URL(img.src);
        const { pathname } = url;
        return { src: img.src, width: img.width, height: img.height, alt: img.alt || 'no alt', pathname: pathname, ext: pathname.split('.')[1] };
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