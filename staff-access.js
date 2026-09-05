// =========================================================
// ZONE-431 — STAFF ACCESS
// =========================================================

const SUPABASE_URL =
    "https://pvtrlplsplyigvxiykce.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_iwAj_zFrWEsMcqUKNINwJw_Po3QAwDG";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================================
// CRÉATION DE LA FENÊTRE
// =========================================================

function createStaffAccessModal() {

    // Si elle existe déjà, on ne la recrée pas
    if (document.querySelector(".staff-access-modal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.className = "staff-access-modal";

    modal.innerHTML = `

        <div class="staff-access-box">

            <button
                type="button"
                class="staff-access-close"
                aria-label="Fermer"
            >
                ×
            </button>

            <div class="staff-access-label">
                ZONE-431
            </div>

            <h2>
                ACCÈS STAFF
            </h2>

            <div class="staff-access-description">
                Entrez votre code d'accès afin d'accéder
                à l'espace réservé au personnel de la Zone-431.
            </div>

            <input
                type="password"
                class="staff-access-input"
                placeholder="CODE D'ACCÈS"
                autocomplete="off"
            >

            <div class="staff-access-message"></div>

            <button
                type="button"
                class="staff-access-submit"
            >
                ACCÉDER
            </button>

        </div>

    `;

    document.body.appendChild(modal);


    // =====================================================
    // BOUTON FERMER
    // =====================================================

    const closeButton =
        modal.querySelector(".staff-access-close");

    closeButton.addEventListener("click", () => {

        closeStaffAccess();

    });


    // =====================================================
    // BOUTON ACCÉDER
    // =====================================================

    const submitButton =
        modal.querySelector(".staff-access-submit");

    submitButton.addEventListener("click", () => {

        checkStaffAccess();

    });


    // =====================================================
    // TOUCHE ENTRÉE
    // =====================================================

    const input =
        modal.querySelector(".staff-access-input");

    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            checkStaffAccess();

        }

    });

}


// =========================================================
// OUVRIR
// =========================================================

function openStaffAccess(event) {

    if (event) {
        event.preventDefault();
    }

    createStaffAccessModal();

    const modal =
        document.querySelector(".staff-access-modal");

    if (!modal) {
        return;
    }

    // IMPORTANT :
    // Ton CSS utilise .active pour afficher la fenêtre
    modal.classList.add("active");

    setTimeout(() => {

        const input =
            modal.querySelector(".staff-access-input");

        if (input) {
            input.focus();
        }

    }, 100);

}


// =========================================================
// FERMER
// =========================================================

function closeStaffAccess() {

    const modal =
        document.querySelector(".staff-access-modal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

}


// =========================================================
// MESSAGE
// =========================================================

function showStaffMessage(
    text,
    type = ""
) {

    const modal =
        document.querySelector(".staff-access-modal");

    if (!modal) {
        return;
    }

    const message =
        modal.querySelector(".staff-access-message");

    if (!message) {
        return;
    }

    message.textContent = text;

    message.className =
        "staff-access-message";

    if (type) {
        message.classList.add(type);
    }

}


// =========================================================
// VÉRIFICATION DU CODE
// =========================================================

async function checkStaffAccess() {

    const modal =
        document.querySelector(".staff-access-modal");

    if (!modal) {
        return;
    }


    const input =
        modal.querySelector(".staff-access-input");

    const submitButton =
        modal.querySelector(".staff-access-submit");


    if (!input || !submitButton) {
        return;
    }


    const enteredCode =
        input.value.trim();


    // =====================================================
    // CODE VIDE
    // =====================================================

    if (!enteredCode) {

        showStaffMessage(
            "VEUILLEZ ENTRER UN CODE.",
            "error"
        );

        input.focus();

        return;

    }


    // =====================================================
    // BLOQUE LE BOUTON
    // =====================================================

    submitButton.disabled = true;

    submitButton.textContent =
        "VÉRIFICATION...";


    showStaffMessage(
        "VÉRIFICATION DE L'ACCÈS..."
    );


    try {

        // =================================================
        // ON SUPPRIME L'ANCIENNE SESSION
        // =================================================

       let {
    data: sessionData,
    error: sessionError
} = await supabaseClient.auth.getSession();

if (sessionError) {
    console.error(
        "ZONE-431 — Erreur récupération session :",
        sessionError
    );
    showStaffMessage(
        "ERREUR D'AUTHENTIFICATION.",
        "error"
    );
    return;
}

if (!sessionData || !sessionData.session) {
    const result =
        await supabaseClient.auth.signInAnonymously();

    sessionData = result.data;
    sessionError = result.error;

    if (sessionError) {
        console.error(
            "ZONE-431 — Erreur création session :",
            sessionError
        );
        showStaffMessage(
            "ERREUR D'AUTHENTIFICATION.",
            "error"
        );
        return;
    }
}


        if (sessionError) {

            console.error(
                "ZONE-431 — Erreur création session :",
                sessionError
            );

            showStaffMessage(
                "ERREUR D'AUTHENTIFICATION.",
                "error"
            );

            return;

        }


        if (
            !sessionData ||
            !sessionData.session
        ) {

            showStaffMessage(
                "SESSION SUPABASE INTROUVABLE.",
                "error"
            );

            return;

        }


        // =================================================
        // VÉRIFICATION DU CODE VIA RPC
        // =================================================

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "check_staff_code",
                {
                    input_code: enteredCode
                }
            );


        if (error) {

            console.error(
                "ZONE-431 — Erreur check_staff_code :",
                error
            );

            showStaffMessage(
                "ERREUR LORS DE LA VÉRIFICATION.",
                "error"
            );

            return;

        }


        // =================================================
        // CODE REFUSÉ
        // =================================================

        if (
            !data ||
            !Array.isArray(data) ||
            data.length === 0
        ) {

            showStaffMessage(
                "CODE INCORRECT OU ACCÈS DÉSACTIVÉ.",
                "error"
            );

            input.value = "";

            input.focus();

            return;

        }


        // =================================================
        // RÉCUPÉRATION DU RÔLE
        // =================================================

        const role =
            data[0].role;


        if (!role) {

            console.error(
                "ZONE-431 — Aucun rôle retourné."
            );

            showStaffMessage(
                "RÔLE STAFF INTROUVABLE.",
                "error"
            );

            return;

        }


        // =================================================
        // STOCKAGE DU RÔLE
        // =================================================

        sessionStorage.setItem(
            "zone431_role",
            role
        );

        sessionStorage.setItem(
            "zone431_staff_authenticated",
            "true"
        );


        // =================================================
        // SUCCÈS
        // =================================================

        showStaffMessage(
            "ACCÈS AUTORISÉ — " + role,
            "success"
        );


        // =================================================
        // REDIRECTION
        // =================================================

        setTimeout(() => {

            window.location.href =
                "zone staff.html";

        }, 500);


    } catch (error) {

        console.error(
            "ZONE-431 — Erreur inattendue :",
            error
        );

        showStaffMessage(
            "UNE ERREUR INATTENDUE EST SURVENUE.",
            "error"
        );


    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            "ACCÉDER";

    }

}


// =========================================================
// RÉCUPÉRER LE RÔLE ACTUEL
// =========================================================

async function getCurrentStaffRole() {

    try {

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (
            sessionError ||
            !sessionData ||
            !sessionData.session
        ) {

            return null;

        }


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "current_staff_role"
            );


        if (error) {

            console.error(
                "ZONE-431 — Erreur récupération rôle :",
                error
            );

            return null;

        }


        return data || null;


    } catch (error) {

        console.error(
            "ZONE-431 — Erreur getCurrentStaffRole :",
            error
        );

        return null;

    }

}


// =========================================================
// INITIALISATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createStaffAccessModal();

    }
);


// =========================================================
// EXPORTS
// =========================================================

window.openStaffAccess =
    openStaffAccess;

window.closeStaffAccess =
    closeStaffAccess;

window.checkStaffAccess =
    checkStaffAccess;

window.getCurrentStaffRole =
    getCurrentStaffRole;
