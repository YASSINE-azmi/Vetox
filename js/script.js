/* =========================================
               THEME MANAGER
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // Get the toggle button and page body
  const themeToggleBtn = document.getElementById('theme-toggle');
  const bodyElement = document.body;

  // Stop here if the button is missing
  if (!themeToggleBtn) {
    console.warn("⚠️ Dark mode toggle button not found on this page.");
    return;
  }

  // Apply the saved theme
  const savedTheme = localStorage.getItem('vetox-theme');
  if (savedTheme === 'dark') {
    bodyElement.classList.add('dark-mode');
  }

  // Switch theme and save the choice
  themeToggleBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('dark-mode');

    if (bodyElement.classList.contains('dark-mode')) {
      localStorage.setItem('vetox-theme', 'dark');
    } else {
      localStorage.setItem('vetox-theme', 'light');
    }
  });

});

// ====================================================================
//                     SEARCH AND FILTER
// ====================================================================


document.addEventListener('DOMContentLoaded', () => {

  const searchBtn = document.querySelector('.search');
  const selects = document.querySelectorAll('.filters select');
  const carsContainer = document.querySelector('section.cars');

  const isCarsPage = window.location.pathname.includes('cars.html');
  const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');

  if (selects.length < 3) {
    return;
  }

  function buildSearchParams() {
    const params = new URLSearchParams();

    const marqueValue = selects[0].value;
    const carburantValue = selects[1].value;
    const budgetValue = selects[2].value;

    if (marqueValue !== "Marque") params.append("marque", marqueValue);
    if (carburantValue !== "Type de carburant") params.append("carburant", carburantValue);
    if (budgetValue !== "Budget Max") params.append("budget", parseInt(budgetValue));

    return params;
  }

  function syncFiltersWithUrl() {
    if (!isCarsPage) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const selectedMarque = params.get('marque');
    const selectedCarburant = params.get('carburant');
    const selectedBudget = params.get('budget');

    if (selectedMarque) selects[0].value = selectedMarque;
    if (selectedCarburant) selects[1].value = selectedCarburant;
    if (selectedBudget) selects[2].value = `${selectedBudget} DH`;
  }

  function buildCatalogueSections() {
    if (!isCarsPage || !carsContainer || carsContainer.dataset.grouped === "true") {
      return;
    }

    const cards = Array.from(carsContainer.querySelectorAll('.card'));

    if (cards.length === 0) {
      return;
    }

    const groupedCars = new Map();

    cards.forEach((card) => {
      const marque = card.getAttribute('data-marque')?.trim() || "Autres";

      if (!groupedCars.has(marque)) {
        groupedCars.set(marque, []);
      }

      groupedCars.get(marque).push(card);
    });

    carsContainer.innerHTML = "";
    carsContainer.classList.remove("cars");
    carsContainer.classList.add("catalogue-sections");
    carsContainer.dataset.grouped = "true";

    groupedCars.forEach((marqueCards, marqueName) => {
      const section = document.createElement("section");
      section.className = "catalogue-section";
      section.setAttribute("data-marque-section", marqueName);

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "section-toggle";
      toggleBtn.innerHTML = `
        <span>${marqueName}</span>
        <span class="section-arrow">+</span>
      `;

      const sectionCars = document.createElement("div");
      sectionCars.className = "section-cars cars";

      marqueCards.forEach((card) => {
        sectionCars.appendChild(card);
      });

      toggleBtn.addEventListener("click", () => {
        section.classList.toggle("open");
      });

      section.appendChild(toggleBtn);
      section.appendChild(sectionCars);
      carsContainer.appendChild(section);
    });
  }

  function applyCatalogueFilters() {
    if (!isCarsPage) {
      return;
    }

    const sections = document.querySelectorAll('.catalogue-section');
    const cards = document.querySelectorAll('.catalogue-section .card');

    const selectedMarque = selects[0].value;
    const selectedCarburant = selects[1].value;
    const selectedBudget = selects[2].value !== "Budget Max" ? parseInt(selects[2].value) : null;

    const hasActiveFilter =
      selectedMarque !== "Marque" ||
      selectedCarburant !== "Type de carburant" ||
      selectedBudget !== null;

    cards.forEach((card) => {
      const carMarque = card.getAttribute('data-marque');
      const carCarburant = card.getAttribute('data-carburant');
      const carPrix = parseInt(card.getAttribute('data-prix'));

      const matchMarque = selectedMarque === "Marque" || carMarque === selectedMarque;
      const matchCarburant = selectedCarburant === "Type de carburant" || carCarburant === selectedCarburant;
      const matchBudget = selectedBudget === null || carPrix <= selectedBudget;

      card.style.display = (matchMarque && matchCarburant && matchBudget) ? "" : "none";
    });

    sections.forEach((section) => {
      const sectionCards = Array.from(section.querySelectorAll('.card'));
      const visibleCards = sectionCards.filter((card) => card.style.display !== "none");

      // Hide sections with no matching cars
      if (visibleCards.length === 0) {
        section.style.display = "none";
        section.classList.remove("open");
        return;
      }

      section.style.display = "";

      if (!hasActiveFilter) {
        section.classList.remove("open");
      } else {
        // Open matching sections only when a filter is active
        section.classList.add("open");
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const params = buildSearchParams();
      const queryString = params.toString();

      if (isIndexPage) {
        window.location.href = queryString ? `cars.html?${queryString}` : 'cars.html';
        return;
      }

      if (isCarsPage) {
        const newUrl = queryString ? `cars.html?${queryString}` : 'cars.html';
        window.history.replaceState({}, "", newUrl);
        applyCatalogueFilters();
      }
    });
  }

  if (isCarsPage) {
    syncFiltersWithUrl();
    buildCatalogueSections();
    applyCatalogueFilters();

    selects.forEach((select) => {
      select.addEventListener("change", () => {
        const params = buildSearchParams();
        const queryString = params.toString();
        const newUrl = queryString ? `cars.html?${queryString}` : 'cars.html';

        window.history.replaceState({}, "", newUrl);
        applyCatalogueFilters();
      });
    });

    if (searchBtn) {
      searchBtn.style.display = "none";
    }
  }

});

// ====================================================================
//                  CAR DATA AND DETAILS PAGE
// ====================================================================

// Local car data used on the details page
const carsData = {
  "audi-rs7": {
    name: "Audi rs7",
    price: "1500 DH / J",
    image1: "../assets/cars-details/Audi rs7/1.jpeg",
    image2: "../assets/cars-details/Audi rs7/2.jpeg",
    image3: "../assets/cars-details/Audi rs7/3.jpeg",
    image4: "../assets/cars-details/Audi rs7/4.jpeg",
    year: "2017",
    fuel: "Essence",
    mileage: "150k KM",
    features: {
      info1: "⚡ V8 Bi-Turbo", p1: "Puissance brutale et accélération phénoménale pour des sensations fortes.",
      info2: "🏎️ Dynamisme", p2: "Transmission Quattro offrant une adhérence parfaite et une tenue de route exceptionnelle.",
      info3: "💻 Cockpit Virtuel", p3: "Tableau de bord entièrement numérique avec navigation immersive 3D.",
      info4: "💺 4 Places sportives", p4: "Sièges baquets ultra-confortables avec finitions haut de gamme en cuir."
    }
  },
  "bmw-m5": {
    name: "BMW M5",
    price: "1300 DH / J",
    image1: "../assets/cars-details/Bmw m5/1.jpeg",
    image2: "../assets/cars-details/Bmw m5/2.jpeg",
    image3: "../assets/cars-details/Bmw m5/3.jpeg",
    image4: "../assets/cars-details/Bmw m5/4.jpeg",
    year: "2015",
    fuel: "Essence",
    mileage: "180k KM",
    features: {
      info1: "⚡ M TwinPower Turbo", p1: "Des accélérations dignes d'une supercar avec une maniabilité de précision.",
      info2: "⚙️ M xDrive", p2: "Système à transmission intégrale pour une agilité et une motricité maximales.",
      info3: "💻 Affichage Tête Haute", p3: "Gardez les yeux sur la route avec les informations projetées sur le pare-brise.",
      info4: "💺 5 Places luxueuses", p4: "Habitacle spacieux alliant sportivité agressive et raffinement absolu."
    }
  },
  "dacia-logan": {
    name: "Dacia Logan",
    price: "400 DH / J",
    image1: "../assets/cars-details/Dacia logan/1.jpeg",
    image2: "../assets/cars-details/Dacia logan/2.jpeg",
    image3: "../assets/cars-details/Dacia logan/3.jpeg",
    image4: "../assets/cars-details/Dacia logan/4.jpeg",
    year: "2019",
    fuel: "Essence",
    mileage: "150k KM",
    features: {
      info1: "🛠️ Fiabilité absolue", p1: "Une mécanique robuste conçue pour durer et nécessitant peu d'entretien.",
      info2: "⛽ Économie", p2: "Parfaite pour la ville et les longs trajets avec un budget de carburant maîtrisé.",
      info3: "📻 Équipement essentiel", p3: "Radio, Bluetooth et climatisation pour un confort optimal au quotidien.",
      info4: "💺 5 Places pratiques", p4: "Un espace généreux pour les passagers et l'un des plus grands coffres de sa catégorie."
    }
  },
  "honda-civic": {
    name: "Honda Civic Hatchback",
    price: "900 DH / J",
    image1: "../assets/cars-details/Honda Civic Hatchback 2017/1.jpg",
    image2: "../assets/cars-details/Honda Civic Hatchback 2017/2.jpg",
    image3: "../assets/cars-details/Honda Civic Hatchback 2017/3.jpg",
    image4: "../assets/cars-details/Honda Civic Hatchback 2017/4.jpg",
    year: "2017",
    fuel: "Essence",
    mileage: "167k KM",
    features: {
      info1: "⚡ Conduite dynamique", p1: "Un châssis réactif et un moteur VTEC offrant un plaisir de conduite unique.",
      info2: "⛽ Efficience", p2: "Consommation de carburant optimisée sans jamais sacrifier les performances.",
      info3: "🛡️ Honda Sensing", p3: "Technologies de sécurité avancées pour une conduite en toute sérénité.",
      info4: "💺 5 Places modulables", p4: "Sièges ergonomiques et espace de chargement arrière très polyvalent."
    }
  },
  "mercedes-c-class": {
    name: "Mercedes C Class",
    price: "1300 DH / J",
    image1: "../assets/cars-details/Mercedes c class/1.jpeg",
    image2: "../assets/cars-details/Mercedes c class/2.jpeg",
    image3: "../assets/cars-details/Mercedes c class/3.jpeg",
    image4: "../assets/cars-details/Mercedes c class/4.jpeg",
    year: "2020",
    fuel: "Essence",
    mileage: "118k KM",
    features: {
      info1: "☁️ Confort Royal", p1: "Une douceur de conduite inégalée grâce à des suspensions haut de gamme.",
      info2: "🤫 Insonorisation", p2: "Voyagez dans un silence absolu, parfaitement isolé des bruits de la route.",
      info3: "💻 Système MBUX", p3: "Assistant vocal intelligent et double écran haute résolution tactile.",
      info4: "💺 5 Places Premium", p4: "Finitions en cuir véritable et éclairage d'ambiance intérieur personnalisable."
    }
  },
  "opel-astra": {
    name: "Opel Astra GS Line",
    price: "700 DH / J",
    image1: "../assets/cars-details/Opel Astra GS Line Diesel 2025/1.jpg",
    image2: "../assets/cars-details/Opel Astra GS Line Diesel 2025/2.jpg",
    image3: "../assets/cars-details/Opel Astra GS Line Diesel 2025/3.jpg",
    image4: "../assets/cars-details/Opel Astra GS Line Diesel 2025/4.jpg",
    year: "2025",
    fuel: "Diesel",
    mileage: "69k KM",
    features: {
      info1: "⚡ Design GS Line", p1: "Look agressif, lignes tranchantes et allure résolument sportive.",
      info2: "⛽ Diesel Économique", p2: "Moteur de dernière génération, sobre et idéal pour les gros rouleurs.",
      info3: "💡 Intelli-Lux LED", p3: "Phares matriciels offrant une visibilité nocturne parfaite sans éblouir.",
      info4: "💺 5 Places ergonomiques", p4: "Sièges certifiés pour un maintien parfait du dos sur les longs trajets."
    }
  },
  "peugeot-208": {
    name: "Peugeot 208",
    price: "400 DH / J",
    image1: "../assets/cars-details/Peugeot 208/1.jpeg",
    image2: "../assets/cars-details/Peugeot 208/2.jpeg",
    image3: "../assets/cars-details/Peugeot 208/3.jpeg",
    image4: "../assets/cars-details/Peugeot 208/4.jpeg",
    year: "2021",
    fuel: "Diesel",
    mileage: "120k KM",
    features: {
      info1: "⚡ Agilité urbaine", p1: "Un petit volant et une direction très précise pour se faufiler partout en ville.",
      info2: "⛽ Moteur BlueHDi", p2: "Consommation ultra-réduite et respect des normes environnementales strictes.",
      info3: "💻 i-Cockpit 3D", p3: "Tableau de bord surélevé et écran tactile réactif pour une expérience moderne.",
      info4: "💺 5 Places compactes", p4: "Intérieur stylé et accueillant, parfait pour les trajets quotidiens urbains."
    }
  },
  "vw-polo": {
    name: "Volkswagen Polo",
    price: "500 DH / J",
    image1: "../assets/cars-details/Polo diesel 2014/1.jpeg",
    image2: "../assets/cars-details/Polo diesel 2014/2.jpeg",
    image3: "../assets/cars-details/Polo diesel 2014/3.jpeg",
    image4: "../assets/cars-details/Polo diesel 2014/4.jpeg",
    year: "2014",
    fuel: "Diesel",
    mileage: "199k KM",
    features: {
      info1: "⚙️ Polyvalence", p1: "Aussi à l'aise dans les rues étroites que sur l'autoroute à grande vitesse.",
      info2: "⛽ Faible consommation", p2: "Un moteur TDI réputé pour son endurance et son incroyable économie.",
      info3: "📱 Connectivité", p3: "Système multimédia intuitif pour vous accompagner lors de vos trajets.",
      info4: "💺 5 Places confortables", p4: "Un habitacle bien pensé avec la qualité de finition rigoureuse de VW."
    }
  },
  "skoda-octavia": {
    name: "Skoda Octavia",
    price: "900 DH / J",
    image1: "../assets/cars-details/Skoda octavia/1.jpeg",
    image2: "../assets/cars-details/Skoda octavia/2.jpeg",
    image3: "../assets/cars-details/Skoda octavia/3.jpeg",
    image4: "../assets/cars-details/Skoda octavia/4.jpeg",
    year: "2022",
    fuel: "Diesel",
    mileage: "90k KM",
    features: {
      info1: "🛣️ Grande Routière", p1: "Stabilité et confort exemplaires pour avaler les kilomètres sans fatigue.",
      info2: "⛽ Autonomie TDI", p2: "Motorisation efficiente offrant une autonomie impressionnante pour les voyages.",
      info3: "🛡️ Sécurité active", p3: "Régulateur adaptatif et assistance de maintien dans la voie de série.",
      info4: "💺 5 Places spacieuses", p4: "L'espace aux jambes d'une limousine et un coffre gigantesque (600L+)."
    }
  },
  "tesla-model3": {
    name: "Tesla Model 3",
    price: "1300 DH / J",
    image1: "../assets/cars-details/Tesla model 3/1.jpeg",
    image2: "../assets/cars-details/Tesla model 3/2.jpeg",
    image3: "../assets/cars-details/Tesla model 3/3.jpeg",
    image4: "../assets/cars-details/Tesla model 3/4.jpeg",
    year: "2021",
    fuel: "Electrique",
    mileage: "98k KM",
    features: {
      info1: "⚡ 0-100 km/h en 4.4s", p1: "Accélération fulgurante et ultra-réactive grâce à un moteur 100% électrique.",
      info2: "🔋 629 km d'autonomie", p2: "Voyagez loin en toute tranquillité et sans émissions sur une seule charge.",
      info3: "💻 Autopilot avancé", p3: "Technologie de pointe avec écran tactile de 15,4\" intégrant les aides à la conduite.",
      info4: "💺 5 Places minimalistes", p4: "Confort absolu dans un intérieur épuré, très spacieux et doté d'un double coffre."
    }
  },
  "toyota-corolla": {
    name: "Toyota Corolla",
    price: "400 DH / J",
    image1: "../assets/cars-details/Toyota corolla/1.jpeg",
    image2: "../assets/cars-details/Toyota corolla/2.jpeg",
    image3: "../assets/cars-details/Toyota corolla/3.jpeg",
    image4: "../assets/cars-details/Toyota corolla/4.jpeg",
    year: "2019",
    fuel: "Essence",
    mileage: "40k KM",
    features: {
      info1: "🥇 Fiabilité légendaire", p1: "Un véhicule conçu pour durer des années sans aucun souci mécanique majeur.",
      info2: "⛽ Souplesse", p2: "Moteur à essence silencieux, offrant des transitions fluides et économiques.",
      info3: "🛡️ Toyota Safety Sense", p3: "Pack complet de sécurité active incluant le freinage d'urgence autonome.",
      info4: "💺 5 Places douillettes", p4: "Habitacle ergonomique conçu avec des matériaux durables et agréables."
    }
  },
  "vw-touareg": {
    name: "Volkswagen Touareg",
    price: "1400 DH / J",
    image1: "../assets/cars-details/Volkswagen Touareg/1.jpeg",
    image2: "../assets/cars-details/Volkswagen Touareg/2.jpeg",
    image3: "../assets/cars-details/Volkswagen Touareg/3.jpeg",
    image4: "../assets/cars-details/Volkswagen Touareg/4.jpeg",
    year: "2024",
    fuel: "Essence",
    mileage: "70k KM",
    features: {
      info1: "💪 Puissance V6", p1: "Moteur ultra-performant capable de tracter et de franchir tous les obstacles.",
      info2: "⛰️ 4MOTION", p2: "Adhérence maximale en toutes conditions météorologiques et sur tous les terrains.",
      info3: "💻 Innovision Cockpit", p3: "Tableau de bord digital immersif avec un immense écran d'infodivertissement.",
      info4: "💺 5 Places VIP", p4: "Espace royal pour tous les passagers, matériaux nobles et confort SUV suprême."
    }
  }
};

// Fill the details page using the URL id
document.addEventListener("DOMContentLoaded", () => {
  // Read the car id from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const currentCarId = urlParams.get('id');

  // Get the matching car from the local data
  const selectedCar = carsData[currentCarId];

  // Update the page if the car exists
  if (selectedCar) {
    document.getElementById('breadcrumb-car-name').innerText = selectedCar.name;
    document.getElementById('car-title').innerText = selectedCar.name;
    document.getElementById('car-price').innerText = selectedCar.price;
    document.getElementById('car-main-image1').src = selectedCar.image1;
    document.getElementById('car-main-image2').src = selectedCar.image2;
    document.getElementById('car-main-image3').src = selectedCar.image3;
    document.getElementById('car-main-image4').src = selectedCar.image4;
    // ==========================================
    //           IMAGE SWAP ON HOVER
    // ==========================================
    const mainImage = document.getElementById("car-main-image1");
    const thumbnailImages = document.querySelectorAll(".thumbnail-images img");

    if (mainImage && thumbnailImages.length > 0) {
      thumbnailImages.forEach((thumb) => {
        thumb.addEventListener("mouseenter", () => {
          if (thumb.src === mainImage.src) {
            return;
          }

          const currentMainSrc = mainImage.src;
          const currentMainAlt = mainImage.alt;

          mainImage.src = thumb.src;
          mainImage.alt = thumb.alt;

          thumb.src = currentMainSrc;
          thumb.alt = currentMainAlt;
        });
      });
    }
    // ==========================================
    //     Continuation of the previous code
    // ==========================================
    document.getElementById('car-year').innerText = selectedCar.year;
    document.getElementById('car-fuel').innerText = selectedCar.fuel;
    document.getElementById('car-mileage').innerText = selectedCar.mileage;

    // Fill the feature blocks
    document.getElementById('first_info').innerText = selectedCar.features.info1;
    document.getElementById('first_p').innerText = selectedCar.features.p1;

    document.getElementById('second_info').innerText = selectedCar.features.info2;
    document.getElementById('second_p').innerText = selectedCar.features.p2;

    document.getElementById('third_info').innerText = selectedCar.features.info3;
    document.getElementById('third_p').innerText = selectedCar.features.p3;

    document.getElementById('forth_info').innerText = selectedCar.features.info4;
    document.getElementById('forth_p').innerText = selectedCar.features.p4;
  } else {
    // if the id is invalid
    const titleElement = document.getElementById('car-title');
    if (titleElement) titleElement.innerText = "Voiture Introuvable";
  }

  // ==========================================
  //              RESERVATION DATES
  // ==========================================
  const dateDepart = document.getElementById("date-depart");
  const dateRetour = document.getElementById("date-retour");
  const btnReserver = document.querySelector(".btn-reserver");
  const messageEl = document.getElementById("reservation-message");

  const priceEl = document.getElementById("car-price");
  const dailyPrice = selectedCar ? parseInt(selectedCar.price) : 0;

  function updatePrice() {
    if (!selectedCar || !priceEl || !dateDepart || !dateRetour) {
      return;
    }

    const departVal = dateDepart.value;
    const retourVal = dateRetour.value;

    if (!departVal || !retourVal) {
      priceEl.textContent = selectedCar.price;
      return;
    }

    const d1 = new Date(departVal);
    const d2 = new Date(retourVal);

    if (isNaN(d1) || isNaN(d2) || d2 <= d1) {
      priceEl.textContent = selectedCar.price;
      return;
    }

    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = dailyPrice * diffDays;

    if (diffDays === 1) {
      priceEl.textContent = `${totalPrice} DH / ${diffDays} Jour`;
    } else {
      priceEl.textContent = `${totalPrice} DH / ${diffDays} Jours`;
    }
  }

  if (dateDepart && dateRetour) {
    const today = new Date().toISOString().split('T')[0];
    dateDepart.setAttribute('min', today);
    dateRetour.setAttribute('min', today);

    dateDepart.addEventListener("change", () => {
      dateRetour.setAttribute("min", dateDepart.value || today);
      updatePrice();
    });

    dateRetour.addEventListener("change", updatePrice);
  }

  if (btnReserver && messageEl) {
    btnReserver.addEventListener("click", () => {
      const departVal = dateDepart.value;
      const retourVal = dateRetour.value;

      messageEl.style.display = "block";

      if (!departVal || !retourVal) {
        messageEl.textContent = "Veuillez entrer les deux dates (départ et retour).";
        messageEl.className = "msg-error";
        return;
      }

      const d1 = new Date(departVal);
      const d2 = new Date(retourVal);

      if (d2 <= d1) {
        messageEl.textContent = "La date de retour doit être ultérieure à la date de départ.";
        messageEl.className = "msg-error";
        return;
      }

      // Success message
      messageEl.textContent = "Votre demande a été envoyée ! Notre équipe va l'examiner.";
      messageEl.className = "msg-success";


    });
  }
});


// ====================================================================
//                           HAMBURGER MENU
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      // Toggle the mobile menu
      navLinks.classList.toggle("active");

      // Animate the icon
      hamburger.classList.toggle("active");
    });
  }
});

// ====================================================================
//                  CONTACT FORM VALIDATION
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {

  // Get the contact form
  const contactForm = document.querySelector(".contact-form form");

  // Stop if the form is not available
  if (!contactForm) {
    return;
  }

  const nomInput = contactForm.querySelector('input[name="nom"]');
  const emailInput = contactForm.querySelector('input[name="email"]');
  const sujetInput = contactForm.querySelector('input[name="sujet"]');
  const messageInput = contactForm.querySelector('textarea[name="message"]');
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  // Create the feedback message element
  const feedbackMessage = document.createElement("p");
  feedbackMessage.className = "form-message";
  feedbackMessage.style.marginTop = "12px";
  feedbackMessage.style.fontWeight = "500";
  contactForm.appendChild(feedbackMessage);

  // Update the feedback message
  function showFormMessage(message, type) {
    feedbackMessage.textContent = message;

    if (type === "error") {
      feedbackMessage.style.color = "red";
    } else if (type === "success") {
      feedbackMessage.style.color = "green";
    }
  }

  // Check if the email format is valid
  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Handle form submission
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nomValue = nomInput.value.trim();
    const emailValue = emailInput.value.trim();
    const sujetValue = sujetInput.value.trim();
    const messageValue = messageInput.value.trim();

    // Full name is required
    if (!nomValue) {
      showFormMessage("Veuillez entrer votre nom complet.", "error");
      nomInput.focus();
      return;
    }

    // Email is required
    if (!emailValue) {
      showFormMessage("Veuillez entrer votre adresse email.", "error");
      emailInput.focus();
      return;
    }

    // Email must be valid
    if (!isValidEmail(emailValue)) {
      showFormMessage("Veuillez entrer une adresse email valide.", "error");
      emailInput.focus();
      return;
    }

    // Subject is required
    if (!sujetValue) {
      showFormMessage("Veuillez entrer le sujet de votre message.", "error");
      sujetInput.focus();
      return;
    }

    // Message is required
    if (!messageValue) {
      showFormMessage("Veuillez entrer votre message.", "error");
      messageInput.focus();
      return;
    }

    // Simulate the sending state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi...";
    }

    setTimeout(() => {
      showFormMessage("Votre message a été envoyé avec succès.", "success");
      contactForm.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer le message";
      }

      // Log submitted values for debugging
      console.log("Contact form submitted:", {
        nom: nomValue,
        email: emailValue,
        sujet: sujetValue,
        message: messageValue
      });
    }, 3000);
  });

});