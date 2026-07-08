/* =========================================================
   MUSSUMBA STORE — main.js
   JavaScript do projeto (sem bibliotecas externas).
   Funcionalidades:
   1. Menu de navegação responsivo
   2. Botão voltar ao topo
   3. Modo escuro (dark mode) com memória de preferência
   4. Validação de formulários (funções próprias)
   5. Carrosséis / sliders reutilizáveis
   6. Mapa interativo (Google Maps API) — ver initMussumbaMap()
   7. Integração com redes sociais (partilha + WhatsApp)
   8. Pequenos extras: contador do carrinho, ano automático
   ========================================================= */

(function () {
    "use strict";

    /* =========================================================
       1. MENU DE NAVEGAÇÃO RESPONSIVO
       ========================================================= */
    function initNavToggle() {
        var toggle = document.getElementById("navToggle");
        var navLinks = document.getElementById("navLinks");
        if (!toggle || !navLinks) return;

        toggle.addEventListener("click", function () {
            var isOpen = navLinks.classList.toggle("is-open");
            toggle.classList.toggle("is-open", isOpen);
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        // Fecha o menu ao clicar num link (comum em telemóveis)
        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("is-open");
                toggle.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });

        // Fecha o menu se a janela for redimensionada para desktop
        window.addEventListener("resize", function () {
            if (window.innerWidth > 900) {
                navLinks.classList.remove("is-open");
                toggle.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* =========================================================
       2. BOTÃO VOLTAR AO TOPO
       ========================================================= */
    function initBackToTop() {
        var btn = document.getElementById("backToTop");
        if (!btn) return;

        function toggleVisibility() {
            if (window.scrollY > 400) {
                btn.classList.add("is-visible");
            } else {
                btn.classList.remove("is-visible");
            }
        }

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        toggleVisibility();

        btn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* =========================================================
       3. MODO ESCURO (DARK MODE)
       ========================================================= */
    var THEME_KEY = "mussumba-theme";

    function applyStoredTheme() {
        var stored = null;
        try {
            stored = localStorage.getItem(THEME_KEY);
        } catch (e) {
            stored = null;
        }
        if (stored === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }

    function initThemeToggle() {
        var toggle = document.getElementById("themeToggle");
        if (!toggle) return;
        var icon = toggle.querySelector(".theme-icon");

        function updateIcon() {
            var isDark = document.documentElement.getAttribute("data-theme") === "dark";
            if (icon) icon.textContent = isDark ? "☀" : "🌙";
        }
        updateIcon();

        toggle.addEventListener("click", function () {
            var isDark = document.documentElement.getAttribute("data-theme") === "dark";
            if (isDark) {
                document.documentElement.removeAttribute("data-theme");
                try { localStorage.setItem(THEME_KEY, "light"); } catch (e) {}
            } else {
                document.documentElement.setAttribute("data-theme", "dark");
                try { localStorage.setItem(THEME_KEY, "dark"); } catch (e) {}
            }
            updateIcon();
        });
    }

    /* =========================================================
       4. VALIDAÇÃO DE FORMULÁRIOS (funções próprias)
       ========================================================= */

    // Verifica se um e-mail tem um formato válido (expressão regular simples e própria)
    function isValidEmail(value) {
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(String(value).trim());
    }

    // Verifica se um campo obrigatório foi preenchido
    function isNotEmpty(value) {
        return String(value).trim().length > 0;
    }

    // Verifica um comprimento mínimo de caracteres
    function hasMinLength(value, min) {
        return String(value).trim().length >= min;
    }

    // Mostra uma mensagem de erro por baixo de um campo
    function showFieldError(field, message) {
        clearFieldError(field);
        var wrapper = field.closest(".field") || field.parentElement;
        if (wrapper) wrapper.classList.add("has-error");
        field.classList.add("has-error");

        var errorEl = document.createElement("span");
        errorEl.className = "field-error-msg";
        errorEl.textContent = message;
        errorEl.setAttribute("data-generated-error", "true");

        if (wrapper) {
            wrapper.appendChild(errorEl);
        } else {
            field.insertAdjacentElement("afterend", errorEl);
        }
        field.setAttribute("aria-invalid", "true");
    }

    // Remove a mensagem de erro de um campo
    function clearFieldError(field) {
        var wrapper = field.closest(".field") || field.parentElement;
        field.classList.remove("has-error");
        field.removeAttribute("aria-invalid");
        if (wrapper) {
            wrapper.classList.remove("has-error");
            var existing = wrapper.querySelector('[data-generated-error="true"]');
            if (existing) existing.remove();
        }
        var sibling = field.nextElementSibling;
        if (sibling && sibling.getAttribute && sibling.getAttribute("data-generated-error") === "true") {
            sibling.remove();
        }
    }

    // Mostra uma mensagem de sucesso/erro geral do formulário
    function showFormFeedback(el, message, type) {
        if (!el) return;
        el.textContent = message;
        el.classList.remove("is-success", "is-error");
        el.classList.add(type === "success" ? "is-success" : "is-error");
    }

    // Validação do formulário de Contactos
    function initContactForm() {
        var form = document.getElementById("contactForm");
        if (!form) return;
        var feedback = document.getElementById("contactFeedback");

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var nome = document.getElementById("nome");
            var email = document.getElementById("email");
            var assunto = document.getElementById("assunto");
            var mensagem = document.getElementById("mensagem");
            var valid = true;

            [nome, email, assunto, mensagem].forEach(clearFieldError);

            if (!isNotEmpty(nome.value) || !hasMinLength(nome.value, 3)) {
                showFieldError(nome, "Indique o seu nome completo (mínimo 3 caracteres).");
                valid = false;
            }
            if (!isValidEmail(email.value)) {
                showFieldError(email, "Indique um e-mail válido, por exemplo nome@exemplo.com.");
                valid = false;
            }
            if (!isNotEmpty(assunto.value) || !hasMinLength(assunto.value, 3)) {
                showFieldError(assunto, "Escreva um assunto com pelo menos 3 caracteres.");
                valid = false;
            }
            if (!isNotEmpty(mensagem.value) || !hasMinLength(mensagem.value, 10)) {
                showFieldError(mensagem, "A mensagem deve ter pelo menos 10 caracteres.");
                valid = false;
            }

            if (!valid) {
                showFormFeedback(feedback, "Por favor corrija os campos assinalados a vermelho.", "error");
                return;
            }

            showFormFeedback(feedback, "Mensagem enviada com sucesso! Entraremos em contacto brevemente.", "success");
            form.reset();
        });
    }

    // Validação genérica para formulários de newsletter (pode haver mais do que um na página)
    function initNewsletterForm(formId, emailId, feedbackId) {
        var form = document.getElementById(formId);
        if (!form) return;
        var emailField = document.getElementById(emailId);
        var feedback = document.getElementById(feedbackId);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            clearFieldError(emailField);

            if (!isValidEmail(emailField.value)) {
                emailField.classList.add("has-error");
                showFormFeedback(feedback, "Indique um e-mail válido para se cadastrar.", "error");
                return;
            }

            emailField.classList.remove("has-error");
            showFormFeedback(feedback, "Cadastro efetuado! Vai começar a receber as nossas novidades.", "success");
            form.reset();
        });
    }

    // Remove acentos para permitir pesquisar "camisola" e encontrar "camisolas", etc.
    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    // Pesquisa da barra de topo (existe em todas as páginas)
    function initSearchForms() {
        var isProductsPage = !!document.querySelector(".category-nav");
        var forms = document.querySelectorAll('form[id="searchForm"]');

        forms.forEach(function (form) {
            // Na página de produtos, quem trata a pesquisa é initProductCatalog().
            if (isProductsPage) return;

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("#searchInput");
                if (!input) return;

                if (!isNotEmpty(input.value) || !hasMinLength(input.value, 2)) {
                    input.classList.add("has-error");
                    input.focus();
                    showToast("Escreva pelo menos 2 letras para pesquisar.");
                    return;
                }
                input.classList.remove("has-error");

                // Descobre o caminho certo para produtos.html a partir desta página
                // (na raiz é "html/produtos.html", dentro de html/ é só "produtos.html")
                var produtosLink = document.querySelector('a[href$="produtos.html"]');
                var baseHref = produtosLink ? produtosLink.getAttribute("href") : "produtos.html";
                window.location.href = baseHref + "?q=" + encodeURIComponent(input.value.trim());
            });
        });
    }

    // Catálogo de produtos: filtro por categoria (Homem/Mulher/Crianças) + pesquisa por nome
    function initProductCatalog() {
        var categoryNav = document.querySelector(".category-nav");
        if (!categoryNav) return; // esta função só se aplica à página produtos.html

        var blocks = document.querySelectorAll(".category-block");
        blocks.forEach(function (block) {
            block.dataset.total = block.querySelectorAll(".product-card").length;
        });

        var searchForm = document.getElementById("searchForm");
        var searchInput = document.getElementById("searchInput");
        var noResultsMsg = document.getElementById("noProductsMessage");

        function setActiveButton(category) {
            categoryNav.querySelectorAll("a[data-category]").forEach(function (a) {
                a.classList.toggle("active", a.getAttribute("data-category") === category);
            });
        }

        function resetCounts(block) {
            var countEl = block.querySelector(".category-block-header span");
            if (countEl) {
                var total = block.dataset.total;
                countEl.textContent = total + (total === "1" ? " produto" : " produtos");
            }
        }

        function showCategory(category) {
            blocks.forEach(function (block) {
                var show = category === "todos" || block.id === category;
                block.hidden = !show;
                block.querySelectorAll(".product-card").forEach(function (card) {
                    card.hidden = false;
                });
                resetCounts(block);
            });
            setActiveButton(category);
            if (noResultsMsg) noResultsMsg.hidden = true;
            if (searchInput) searchInput.value = "";
        }

        function filterByName(term) {
            var normTerm = normalizeText(term);
            var totalVisible = 0;

            blocks.forEach(function (block) {
                block.hidden = false;
                var visibleInBlock = 0;
                block.querySelectorAll(".product-card").forEach(function (card) {
                    var nameEl = card.querySelector("h3");
                    var name = nameEl ? normalizeText(nameEl.textContent) : "";
                    var match = name.indexOf(normTerm) !== -1;
                    card.hidden = !match;
                    if (match) visibleInBlock++;
                });
                block.hidden = visibleInBlock === 0;
                totalVisible += visibleInBlock;
                var countEl = block.querySelector(".category-block-header span");
                if (countEl) {
                    countEl.textContent = visibleInBlock + (visibleInBlock === 1 ? " produto" : " produtos");
                }
            });

            setActiveButton(null);
            if (noResultsMsg) noResultsMsg.hidden = totalVisible > 0;
        }

        categoryNav.querySelectorAll("a[data-category]").forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                showCategory(link.getAttribute("data-category"));
                var newUrl = link.getAttribute("data-category") === "todos"
                    ? window.location.pathname
                    : "#" + link.getAttribute("data-category");
                history.replaceState(null, "", newUrl);
                document.querySelector(".section h2").scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        if (searchForm && searchInput) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var term = searchInput.value.trim();
                if (!isNotEmpty(term) || !hasMinLength(term, 2)) {
                    searchInput.classList.add("has-error");
                    searchInput.focus();
                    showToast("Escreva pelo menos 2 letras para pesquisar.");
                    return;
                }
                searchInput.classList.remove("has-error");
                filterByName(term);
            });
        }

        // Ao abrir a página: aplica ?q=... (vindo doutra página) ou #categoria
        var params = new URLSearchParams(window.location.search);
        var qParam = params.get("q");
        if (qParam) {
            if (searchInput) searchInput.value = qParam;
            filterByName(qParam);
        } else if (window.location.hash) {
            var hashCat = window.location.hash.replace("#", "");
            if (document.getElementById(hashCat)) {
                showCategory(hashCat);
            }
        }
    }

    /* =========================================================
       5. CARROSSÉIS / SLIDERS
       ========================================================= */
    function initCarousels() {
        var carousels = document.querySelectorAll("[data-carousel]");
        carousels.forEach(function (carousel) {
            var track = carousel.querySelector(".carousel-track");
            var slides = carousel.querySelectorAll(".carousel-slide");
            var prevBtn = carousel.querySelector(".carousel-prev");
            var nextBtn = carousel.querySelector(".carousel-next");
            var dotsWrap = carousel.querySelector(".carousel-dots");
            if (!track || slides.length === 0) return;

            var current = 0;
            var autoplayDelay = parseInt(carousel.getAttribute("data-autoplay"), 10) || 0;
            var timer = null;

            // Cria os pontos (dots) de navegação
            if (dotsWrap) {
                slides.forEach(function (_, index) {
                    var dot = document.createElement("button");
                    dot.type = "button";
                    dot.setAttribute("aria-label", "Ir para o slide " + (index + 1));
                    if (index === 0) dot.classList.add("is-active");
                    dot.addEventListener("click", function () {
                        goToSlide(index);
                        restartAutoplay();
                    });
                    dotsWrap.appendChild(dot);
                });
            }

            function updateDots() {
                if (!dotsWrap) return;
                dotsWrap.querySelectorAll("button").forEach(function (dot, index) {
                    dot.classList.toggle("is-active", index === current);
                });
            }

            function goToSlide(index) {
                current = (index + slides.length) % slides.length;
                track.style.transform = "translateX(-" + current * 100 + "%)";
                updateDots();
            }

            function nextSlide() {
                goToSlide(current + 1);
            }

            function prevSlide() {
                goToSlide(current - 1);
            }

            if (nextBtn) nextBtn.addEventListener("click", function () { nextSlide(); restartAutoplay(); });
            if (prevBtn) prevBtn.addEventListener("click", function () { prevSlide(); restartAutoplay(); });

            function startAutoplay() {
                if (autoplayDelay > 0 && slides.length > 1) {
                    timer = setInterval(nextSlide, autoplayDelay);
                }
            }

            function stopAutoplay() {
                if (timer) clearInterval(timer);
            }

            function restartAutoplay() {
                stopAutoplay();
                startAutoplay();
            }

            carousel.addEventListener("mouseenter", stopAutoplay);
            carousel.addEventListener("mouseleave", startAutoplay);

            // Suporte a gestos de deslizar (touch) para telemóveis
            var touchStartX = 0;
            var touchEndX = 0;
            track.addEventListener("touchstart", function (e) {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoplay();
            }, { passive: true });

            track.addEventListener("touchend", function (e) {
                touchEndX = e.changedTouches[0].screenX;
                var diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 40) {
                    if (diff > 0) nextSlide(); else prevSlide();
                }
                startAutoplay();
            }, { passive: true });

            goToSlide(0);
            startAutoplay();
        });
    }

    /* =========================================================
       6. MAPA INTERATIVO (Google Maps JavaScript API)
       Esta função é chamada automaticamente pelo Google Maps
       assim que o script da API terminar de carregar (ver o
       parâmetro "callback=initMussumbaMap" em mapa.html).
       Se a página não tiver o elemento #map, a função não faz nada.
       ========================================================= */
    window.initMussumbaMap = function () {
        var mapEl = document.getElementById("map");
        if (!mapEl || typeof google === "undefined" || !google.maps) return;

        var mussumbaLocation = { lat: -8.8383, lng: 13.2344 }; // Luanda, Angola

        var map = new google.maps.Map(mapEl, {
            center: mussumbaLocation,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: true
        });

        var marker = new google.maps.Marker({
            position: mussumbaLocation,
            map: map,
            title: "Mussumba Store"
        });

        var infoWindow = new google.maps.InfoWindow({
            content:
                '<div style="font-family: Poppins, Arial, sans-serif; max-width:220px;">' +
                "<strong>Mussumba Store</strong><br>" +
                "Luanda, Angola<br>" +
                'Atendimento via <a href="https://wa.me/244946644091" target="_blank" rel="noopener">WhatsApp</a>' +
                "</div>"
        });

        marker.addListener("click", function () {
            infoWindow.open({ anchor: marker, map: map });
        });

        // Abre a informação automaticamente ao carregar
        infoWindow.open({ anchor: marker, map: map });
    };

    /* =========================================================
       7. REDES SOCIAIS: partilha da página + WhatsApp
       ========================================================= */
    function showToast(message) {
        var toast = document.querySelector(".mussumba-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "mussumba-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("is-visible");
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(function () {
            toast.classList.remove("is-visible");
        }, 2600);
    }

    function initShareButton() {
        var shareBtn = document.getElementById("shareBtn");
        if (!shareBtn) return;

        shareBtn.addEventListener("click", function () {
            var shareData = {
                title: document.title,
                text: "Vê esta página da Mussumba Store:",
                url: window.location.href
            };

            if (navigator.share) {
                navigator.share(shareData).catch(function () {
                    /* utilizador cancelou a partilha, ignorar */
                });
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).then(function () {
                    showToast("Link copiado! Cole onde quiser partilhar.");
                });
            } else {
                showToast("Copie o link do navegador para partilhar esta página.");
            }
        });
    }

    /* =========================================================
       8. EXTRAS: ano automático no rodapé, ligação do carrinho
       ========================================================= */
    function updateCopyrightYear() {
        var copyrightEls = document.querySelectorAll(".copyright");
        var year = new Date().getFullYear();
        copyrightEls.forEach(function (el) {
            el.textContent = el.textContent.replace(/\d{4}/, year);
        });
    }

    /* =========================================================
       9. CARRINHO DE COMPRAS (guardado no localStorage)
       Estrutura de cada item: { id, name, price, img, qty }
       ========================================================= */
    var CART_KEY = "mussumba-cart";

    function getCart() {
        try {
            var raw = localStorage.getItem(CART_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            /* localStorage indisponível (ex.: navegação privada) — ignorar */
        }
    }

    function formatKz(value) {
        var rounded = Math.round(value);
        return "Kz " + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Atualiza o número junto ao ícone do carrinho em todas as páginas
    function updateCartCount() {
        var cart = getCart();
        var totalQty = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
        document.querySelectorAll(".cart-count").forEach(function (el) {
            el.textContent = totalQty;
        });
    }

    // Adiciona um produto ao carrinho (ou aumenta a quantidade se já existir)
    function addToCart(product) {
        var cart = getCart();
        var existing = cart.find(function (item) { return item.id === product.id; });
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.img,
                qty: 1
            });
        }
        saveCart(cart);
        updateCartCount();
        showToast(product.name + " adicionado ao carrinho.");
    }

    // Liga o clique de cada botão "Adicionar ao carrinho" (páginas de catálogo)
    function initAddToCartButtons() {
        var buttons = document.querySelectorAll(".btn-cart[data-id]");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                addToCart({
                    id: btn.getAttribute("data-id"),
                    name: btn.getAttribute("data-name"),
                    price: parseFloat(btn.getAttribute("data-price")) || 0,
                    img: btn.getAttribute("data-img") || ""
                });
            });
        });
    }

    // Constrói a página do carrinho (carrinho.html) a partir do localStorage
    function renderCartPage() {
        var grid = document.getElementById("cartItemsGrid");
        if (!grid) return; // não estamos na página do carrinho

        var emptyMsg = document.getElementById("cartEmptyMessage");
        var layout = document.getElementById("cartLayout");
        var subtotalEl = document.getElementById("cartSubtotal");
        var totalEl = document.getElementById("cartTotal");
        var itemsCountEl = document.getElementById("cartItemsCount");

        // Ícone de lixo (SVG) usado no botão de remover cada artigo
        var TRASH_SVG =
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
            'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>' +
            '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>' +
            '<path d="M10 11v6"/><path d="M14 11v6"/></svg>';

        // Escapa texto para evitar quebras de layout ou injeção via nome do produto
        function escapeHtml(text) {
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function draw() {
            var cart = getCart();
            grid.innerHTML = "";

            if (cart.length === 0) {
                if (emptyMsg) emptyMsg.hidden = false;
                if (layout) layout.hidden = true;
                updateCartCount();
                return;
            }

            if (emptyMsg) emptyMsg.hidden = true;
            if (layout) layout.hidden = false;

            var subtotal = 0;
            var totalQty = 0;

            cart.forEach(function (item, index) {
                subtotal += item.price * item.qty;
                totalQty += item.qty;

                var article = document.createElement("article");
                article.className = "cart-item";
                article.style.setProperty("--i", index);

                var safeName = escapeHtml(item.name);
                var mediaHtml = item.img
                    ? '<img src="' + encodeURI(item.img) + '" alt="' + safeName + '" loading="lazy">'
                    : '<span class="cart-item-placeholder" aria-hidden="true">' +
                      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" ' +
                      'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                      '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>' +
                      '<path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></span>';

                article.innerHTML =
                    '<div class="cart-item-media">' + mediaHtml + "</div>" +
                    '<div class="cart-item-body">' +
                        '<div class="cart-item-top">' +
                            '<h3 class="cart-item-name">' + safeName + "</h3>" +
                            '<button type="button" class="cart-item-remove" aria-label="Remover ' + safeName + '">' +
                                TRASH_SVG +
                            "</button>" +
                        "</div>" +
                        '<p class="cart-item-unit">' + formatKz(item.price) + ' <span>/ unidade</span></p>' +
                        '<div class="cart-item-foot">' +
                            '<div class="cart-stepper" role="group" aria-label="Quantidade">' +
                                '<button type="button" class="cart-stepper-btn" data-action="decrease" aria-label="Diminuir quantidade">&minus;</button>' +
                                '<span class="cart-stepper-value">' + item.qty + "</span>" +
                                '<button type="button" class="cart-stepper-btn" data-action="increase" aria-label="Aumentar quantidade">+</button>' +
                            "</div>" +
                            '<strong class="cart-item-total">' + formatKz(item.price * item.qty) + "</strong>" +
                        "</div>" +
                    "</div>";

                article.querySelector('[data-action="increase"]').addEventListener("click", function () {
                    changeQty(item.id, 1);
                });
                article.querySelector('[data-action="decrease"]').addEventListener("click", function () {
                    changeQty(item.id, -1);
                });
                article.querySelector(".cart-item-remove").addEventListener("click", function () {
                    removeFromCart(item.id);
                });

                grid.appendChild(article);
            });

            if (subtotalEl) subtotalEl.textContent = formatKz(subtotal);
            if (totalEl) totalEl.textContent = formatKz(subtotal);
            if (itemsCountEl) itemsCountEl.textContent = totalQty + (totalQty === 1 ? " artigo" : " artigos");

            updateCartCount();
        }

        function changeQty(id, delta) {
            var cart = getCart();
            var item = cart.find(function (i) { return i.id === id; });
            if (!item) return;
            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(function (i) { return i.id !== id; });
            }
            saveCart(cart);
            draw();
        }

        function removeFromCart(id) {
            var cart = getCart().filter(function (i) { return i.id !== id; });
            saveCart(cart);
            draw();
        }

        // Botão "Finalizar compra via WhatsApp": monta uma mensagem com os
        // itens do carrinho e abre o WhatsApp já com o texto pronto a enviar.
        var checkoutBtn = document.getElementById("checkoutWhatsapp");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", function () {
                var cart = getCart();
                if (cart.length === 0) {
                    showToast("O seu carrinho está vazio.");
                    return;
                }

                var subtotal = 0;
                var linhas = cart.map(function (item) {
                    subtotal += item.price * item.qty;
                    return "- " + item.name + " (x" + item.qty + "): " + formatKz(item.price * item.qty);
                });

                var mensagem =
                    "Olá! Gostaria de finalizar esta compra na Mussumba Store:\n\n" +
                    linhas.join("\n") +
                    "\n\nTotal: " + formatKz(subtotal);

                var url = "https://wa.me/244946644091?text=" + encodeURIComponent(mensagem);
                window.open(url, "_blank");
            });
        }

        draw();
    }

    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */
    applyStoredTheme();

    document.addEventListener("DOMContentLoaded", function () {
        initNavToggle();
        initBackToTop();
        initThemeToggle();
        initContactForm();
        initNewsletterForm("newsletterFormHome", "newsletterEmailHome", "newsletterFeedbackHome");
        initNewsletterForm("newsletterFormPage", "newsletterEmailPage", "newsletterFeedbackPage");
        initSearchForms();
        initProductCatalog();
        initCarousels();
        initShareButton();
        updateCopyrightYear();
        initAddToCartButtons();
        renderCartPage();
        updateCartCount();
    });
})();
