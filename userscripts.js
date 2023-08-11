// ==UserScript==
// @name         LztStreamerMode
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Режим стримера для Lolzteam
// @author       vuchaev2015
// @match        https://zelenka.guru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zelenka.guru
// @grant        none
// @run-at       document-start
// ==/UserScript==

document.addEventListener("DOMContentLoaded", () => {
    const selectors = [
        "#ConversationListItems",
        ".bbCodeHide",
        ".listPlaceholder",
        "#AlertPanels",
        "#AccountMenu > ul > li.Popup.PopupInPopup.DisableHover > a > span.left",
    ];

    const applyBlur = (selector, trigger = 'hover') => {
        const elements = document.querySelectorAll(selector);

        elements.forEach((el) => {
            if (el.classList.contains("blurred")) return;

            el.style.filter = "blur(5px)";
            el.classList.add("blurred");

            if (trigger === 'click') {
                el.addEventListener("click", () => {
                    el.style.filter = el.style.filter.includes("blur")
                        ? "none"
                    : "blur(5px)";
                });
            } else {
                el.addEventListener("mouseover", () => {el.style.filter = "none";});
                el.addEventListener("mouseout", () => {el.style.filter = "blur(5px)";});
            }
        });
    };

    function applyBlurIfMatchesUrl(url, selector, trigger) {
        if (window.location.href.startsWith(url)) {
            applyBlur(selector, trigger);
        }
    }

    function changeInputType(selector) {
        var inputElements = document.querySelectorAll(selector);
        for (var i = 0; i < inputElements.length; i++) {
            inputElements[i].type = 'password';
        }
    }


    function applyBlurToBBCodeHide(selector, trigger) {
        const elements = document.querySelectorAll(selector);

        elements.forEach((el) => {
            if (el.classList.contains("blurred")) return;

            const quote = el.querySelector("div.quote");
            const quoteContainer = el.querySelector(
                "blockquote.quoteContainer.hideContainer"
            );
            const attribution = el.querySelector("aside > div.attribution.type");

            if (quote && quoteContainer && attribution) {
                quote.style.filter = "blur(5px)";
                el.classList.add("blurred");

                if (trigger === 'click') {
                    quoteContainer.addEventListener("click", function (event) {
                        if (event.target === quoteContainer) {
                            quote.style.filter = quote.style.filter.includes("blur")
                                ? "none"
                            : "blur(5px)";
                        }
                    });

                    quote.addEventListener("click", function (event) {
                        if (event.target === quote) {
                            quote.style.filter = quote.style.filter.includes("blur")
                                ? "none"
                            : "blur(5px)";
                        }
                    });
                } else {
                    quoteContainer.addEventListener("mouseenter", () => { quote.style.filter = "none"; });
                    quoteContainer.addEventListener("mouseleave", () => { quote.style.filter = "blur(5px)"; });
                }
            }
        });
    }

    const applyBlurToAllSelectors = () =>
    selectors.forEach((selector) => {
        if (selector === ".bbCodeHide") {
            applyBlurToBBCodeHide(selector, "click");
        } else {
            applyBlur(selector);
        }
    });

    applyBlurToAllSelectors();
    applyBlurIfMatchesUrl("https://zelenka.guru/account/security", "#ctrl_email", "click");

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                changeInputType('input[name="secret_answer"]'); // превращаем текст в пароль, секретные вопросы
                applyBlurToBBCodeHide('.bbCodeHide', "click"); // ищем новые элементы с хайдом
                applyBlur('[id^="imn-XenForoUniq"] span.message'); // блюрим live сообщения
                applyBlur('.liveAlert.listItemText li[id^="alert"]'); // блюрим live уведомления
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
});

