/* =========================================================
   ZONE-431 — ROSTERS
   Gestion des accès + Supabase
   ========================================================= */


/* =========================================================
   🔐 CODES D'ACCÈS
   =========================================================
   
   👉 AJOUTER UN CODE :
   "NOUVEAU-CODE"

   👉 SUPPRIMER UN CODE :
   supprimer simplement la ligne correspondante.

   STAFF :
   - Peut consulter les rosters

   ADMIN :
   - Peut consulter
   - Peut créer
   - Peut modifier
   - Peut supprimer
   ========================================================= */

const CODES = {

    staff: [
        "m5kTL2nIQLfwz6rQrbu0",
        "nnXNhaZkC8mAUNKF9DP3",
        "3Eu5FonTio9pSCM7F1k9",
        "7PqL69LKm4tYFZl0yPRV"
    ],

    admin: [
        "hsgktWwGFvcKOfk6EbOB",
        "FFBpJNZtfnnpQR9HEE2Y"
    ]

};


/* =========================================================
   ☁️ CONFIGURATION SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://pvtrlplsplyigvxiykce.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_iwAj_zFrWEsMcqUKNINwJw_Po3QAwDG";


/* =========================================================
   VARIABLES
   ========================================================= */

let currentRole = null;

let editingRosterId = null;


/* =========================================================
   ÉLÉMENTS HTML
   ========================================================= */

const accessCodeInput =
    document.getElementById("access-code");

const accessError =
    document.getElementById("access-error");

const authSection =
    document.getElementById("auth-section");

const rosterContent =
    document.getElementById("roster-content");

const accessRole =
    document.getElementById("access-role");

const createRosterButton =
    document.getElementById("create-roster-button");

const rosterFormSection =
    document.getElementById("roster-form-section");

const rosterForm =
    document.getElementById("roster-form");

const formTitle =
    document.getElementById("form-title");

const rostersContainer =
    document.getElementById("rosters-container");


/* =========================================================
   🔐 VÉRIFICATION DU CODE
   ========================================================= */

function checkAccess() {

    const code =
        accessCodeInput.value.trim();


    /* Aucun code */

    if (!code) {

        showAccessError(
            "Veuillez entrer un code d'accès."
        );

        return;
    }


    /* Recherche ADMIN */

    if (CODES.admin.includes(code)) {

        currentRole = "admin";

        grantAccess("ADMIN");

        return;
    }


    /* Recherche STAFF */

    if (CODES.staff.includes(code)) {

        currentRole = "staff";

        grantAccess("STAFF");

        return;
    }


    /* Code incorrect */

    showAccessError(
        "Code d'accès invalide."
    );

}


/* =========================================================
   ✅ ACCÈS AUTORISÉ
   ========================================================= */

function grantAccess(role) {

    authSection.style.display = "none";

    rosterContent.style.display = "block";

    accessRole.textContent = role;


    /* ADMIN */

    if (currentRole === "admin") {

        createRosterButton.style.display =
            "inline-flex";

    }


    /* STAFF */

    else {

        createRosterButton.style.display =
            "none";

    }


    /* Charger les rosters */

    loadRosters();

}


/* =========================================================
   ❌ ERREUR CODE
   ========================================================= */

function showAccessError(message) {

    accessError.textContent = message;

    accessError.style.display = "block";

    accessCodeInput.value = "";

    accessCodeInput.focus();

}


/* =========================================================
   ⌨️ ENTRÉE AVEC LA TOUCHE ENTER
   ========================================================= */

if (accessCodeInput) {

    accessCodeInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                checkAccess();

            }

        }
    );

}


/* =========================================================
   📡 CHARGER LES ROSTERS
   ========================================================= */

async function loadRosters() {

    rostersContainer.innerHTML = `

        <div class="loading-message">

            CHARGEMENT DES ROSTERS...

        </div>

    `;


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/roster?select=*&order=id.asc`,
            {

                method: "GET",

                headers: {

                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        "application/json"

                }

            }
        );


        if (!response.ok) {

            throw new Error(
                `Erreur Supabase : ${response.status}`
            );

        }


        const rosters =
            await response.json();


        displayRosters(rosters);


    }

    catch (error) {

        console.error(
            "Erreur lors du chargement :",
            error
        );


        rostersContainer.innerHTML = `

            <div class="error-message">

                IMPOSSIBLE DE CHARGER LES ROSTERS.

                <br><br>

                Vérifie les permissions Supabase.

            </div>

        `;

    }

}


/* =========================================================
   👀 AFFICHER LES ROSTERS
   ========================================================= */

function displayRosters(rosters) {


    /* Aucun roster */

    if (!rosters || rosters.length === 0) {

        rostersContainer.innerHTML = `

            <div class="empty-message">

                AUCUN ROSTER ENREGISTRÉ.

            </div>

        `;

        return;

    }


    /* Génération */

    rostersContainer.innerHTML = "";


    rosters.forEach(roster => {


        const card =
            document.createElement("article");

        card.className =
            "roster-card";


        card.innerHTML = `

            <div class="roster-card-number">

                ${String(roster.id).padStart(2, "0")}

            </div>


            <div class="roster-card-content">

                <span class="roster-code">

                    ${escapeHTML(
                        roster.departement
                    )}

                </span>


                <h3>

                    ${escapeHTML(
                        roster.nom
                    )}

                </h3>


                <div class="roster-info">

                    <p>

                        <strong>
                            GRADE
                        </strong>

                        ${escapeHTML(
                            roster.grade
                        )}

                    </p>


                    <p>

                        <strong>
                            JOUEUR
                        </strong>

                        ${escapeHTML(
                            roster.joueur
                        )}

                    </p>


                    <p>

                        <strong>
                            STATUT
                        </strong>

                        <span class="roster-status">

                            ${escapeHTML(
                                roster.statut
                            )}

                        </span>

                    </p>

                </div>


                ${
                    currentRole === "admin"

                    ?

                    `

                    <div class="roster-actions">

                        <button
                            type="button"
                            onclick="editRoster(${roster.id})"
                            class="edit-button"
                        >

                            MODIFIER

                        </button>


                        <button
                            type="button"
                            onclick="deleteRoster(${roster.id})"
                            class="delete-button"
                        >

                            SUPPRIMER

                        </button>

                    </div>

                    `

                    :

                    ""

                }

            </div>

        `;


        rostersContainer.appendChild(card);

    });

}


/* =========================================================
   ➕ OUVRIR CRÉATION
   ========================================================= */

function openCreateRoster() {

    if (currentRole !== "admin") {

        return;

    }


    editingRosterId = null;


    rosterForm.reset();


    document.getElementById(
        "roster-id"
    ).value = "";


    formTitle.textContent =
        "CRÉER UN ROSTER";


    rosterFormSection.style.display =
        "block";


    rosterFormSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   ✏️ MODIFIER UN ROSTER
   ========================================================= */

async function editRoster(id) {

    if (currentRole !== "admin") {

        return;

    }


    try {

        const response = await fetch(

            `${SUPABASE_URL}/rest/v1/roster?id=eq.${id}&select=*`,

            {

                method: "GET",

                headers: {

                    "apikey": SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`

                }

            }

        );


        if (!response.ok) {

            throw new Error(
                "Impossible de récupérer le roster."
            );

        }


        const data =
            await response.json();


        if (!data.length) {

            alert(
                "Roster introuvable."
            );

            return;

        }


        const roster =
            data[0];


        editingRosterId =
            roster.id;


        document.getElementById(
            "roster-id"
        ).value = roster.id;


        document.getElementById(
            "roster-nom"
        ).value = roster.nom;


        document.getElementById(
            "roster-departement"
        ).value = roster.departement;


        document.getElementById(
            "roster-grade"
        ).value = roster.grade;


        document.getElementById(
            "roster-joueur"
        ).value = roster.joueur;


        document.getElementById(
            "roster-statut"
        ).value = roster.statut;


        formTitle.textContent =
            "MODIFIER LE ROSTER";


        rosterFormSection.style.display =
            "block";


        rosterFormSection.scrollIntoView({
            behavior: "smooth"
        });


    }

    catch (error) {

        console.error(error);

        alert(
            "Une erreur est survenue."
        );

    }

}


/* =========================================================
   💾 ENREGISTRER
   ========================================================= */

if (rosterForm) {

    rosterForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (currentRole !== "admin") {

                return;

            }


            const nom =
                document.getElementById(
                    "roster-nom"
                ).value.trim();


            const departement =
                document.getElementById(
                    "roster-departement"
                ).value.trim();


            const grade =
                document.getElementById(
                    "roster-grade"
                ).value.trim();


            const joueur =
                document.getElementById(
                    "roster-joueur"
                ).value.trim();


            const statut =
                document.getElementById(
                    "roster-statut"
                ).value;


            const rosterData = {

                nom,
                departement,
                grade,
                joueur,
                statut

            };


            try {

                /* =========================================
                   MODIFICATION
                   ========================================= */

                if (editingRosterId !== null) {

                    const response =
                        await fetch(

                            `${SUPABASE_URL}/rest/v1/roster?id=eq.${editingRosterId}`,

                            {

                                method: "PATCH",

                                headers: {

                                    "apikey":
                                        SUPABASE_KEY,

                                    "Authorization":
                                        `Bearer ${SUPABASE_KEY}`,

                                    "Content-Type":
                                        "application/json",

                                    "Prefer":
                                        "return=minimal"

                                },

                                body:
                                    JSON.stringify(
                                        rosterData
                                    )

                            }

                        );


                    if (!response.ok) {

                        throw new Error(
                            "Erreur lors de la modification."
                        );

                    }


                    alert(
                        "Roster modifié avec succès."
                    );

                }


                /* =========================================
                   CRÉATION
                   ========================================= */

                else {

                    const response =
                        await fetch(

                            `${SUPABASE_URL}/rest/v1/roster`,

                            {

                                method: "POST",

                                headers: {

                                    "apikey":
                                        SUPABASE_KEY,

                                    "Authorization":
                                        `Bearer ${SUPABASE_KEY}`,

                                    "Content-Type":
                                        "application/json",

                                    "Prefer":
                                        "return=minimal"

                                },

                                body:
                                    JSON.stringify(
                                        rosterData
                                    )

                            }

                        );


                    if (!response.ok) {

                        throw new Error(
                            "Erreur lors de la création."
                        );

                    }


                    alert(
                        "Roster créé avec succès."
                    );

                }


                closeRosterForm();

                loadRosters();


            }

            catch (error) {

                console.error(error);

                alert(
                    "Impossible d'enregistrer le roster."
                );

            }

        }
    );

}


/* =========================================================
   🗑️ SUPPRIMER
   ========================================================= */

async function deleteRoster(id) {

    if (currentRole !== "admin") {

        return;

    }


    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer ce roster ?"
        );


    if (!confirmation) {

        return;

    }


    try {

        const response =
            await fetch(

                `${SUPABASE_URL}/rest/v1/roster?id=eq.${id}`,

                {

                    method: "DELETE",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`

                    }

                }

            );


        if (!response.ok) {

            throw new Error(
                "Erreur lors de la suppression."
            );

        }


        alert(
            "Roster supprimé."
        );


        loadRosters();


    }

    catch (error) {

        console.error(error);

        alert(
            "Impossible de supprimer le roster."
        );

    }

}


/* =========================================================
   ❌ FERMER LE FORMULAIRE
   ========================================================= */

function closeRosterForm() {

    editingRosterId = null;

    rosterForm.reset();

    rosterFormSection.style.display =
        "none";

}


/* =========================================================
   🛡️ PROTECTION HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}