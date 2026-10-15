EMERGENCY_KNOWLEDGE_BASE = {

    # ============================================================
    # 1. BLEEDING
    # ============================================================
    "bleeding": {
        "name": "Bleeding",
        "severity": "high",

        "keywords": [
            "bleeding",
            "blood",
            "bleed",
            "heavy bleeding",
            "heavy blood loss",
            "persistent bleeding",
            "bleeding heavily",
            "blood coming out",
            "blood loss",
            "bleeding from wound"
        ],

        "immediate_actions": [
            "Keep the pet calm.",
            "Minimize movement.",
            "Apply steady pressure using clean gauze or cloth.",
            "Seek veterinary care for heavy or persistent bleeding."
        ],

        "avoid": [
            "Do not repeatedly remove the dressing.",
            "Do not pull out deeply embedded objects.",
            "Do not delay veterinary care for severe bleeding."
        ],

        "red_flags": [
            "Heavy bleeding",
            "Bleeding that does not stop",
            "Collapse",
            "Severe weakness",
            "Pale or blue gums"
        ],

        "vet_required": True
    },


    # ============================================================
    # 2. BREATHING PROBLEMS
    # ============================================================
    "breathing_problem": {
        "name": "Breathing Problems",
        "severity": "critical",

        "keywords": [
            "difficulty breathing",
            "difficulty in breathing",
            "breathing problem",
            "breathing problems",
            "can't breathe",
            "cannot breathe",
            "unable to breathe",
            "having trouble breathing",
            "trouble breathing",
            "breathing heavily",
            "heavy breathing",
            "open mouth breathing",
            "shortness of breath",
            "wheezing",
            "gasping for air",
            "struggling to breathe",
            "breathing fast"
        ],

        "immediate_actions": [
            "Keep the pet calm.",
            "Minimize movement.",
            "Contact a veterinarian immediately.",
            "Transport the pet carefully to veterinary care."
        ],

        "avoid": [
            "Do not force food or water.",
            "Do not make the pet exercise.",
            "Do not delay emergency veterinary care."
        ],

        "red_flags": [
            "Severe breathing difficulty",
            "Blue or pale gums",
            "Collapse",
            "Rapid deterioration"
        ],

        "vet_required": True
    },


    # ============================================================
    # 3. POISONING
    # ============================================================
    "poisoning": {
        "name": "Poisoning",
        "severity": "critical",

        "keywords": [
            "poison",
            "poisoning",
            "poisoned",
            "toxic",
            "toxicity",
            "ate something toxic",
            "ate something poisonous",
            "swallowed poison",
            "swallowed something toxic",
            "swallowed some medicine",
            "swallowed medicine",
            "swallowed medication",
            "swallowed some medication",
            "ate medicine",
            "ate some medicine",
            "ate medication",
            "ate some medication",
            "ingested medicine",
            "ingested medication",
            "ingested poison",
            "ingested something toxic",
            "chemical",
            "swallowed chemical",
            "ate toxic food",
            "toxic food",
            "dangerous substance",
            "consumed poison"
        ],

        "immediate_actions": [
            "Remove the pet from the suspected source.",
            "Keep the suspected substance or packaging available.",
            "Contact a veterinarian immediately."
        ],

        "avoid": [
            "Do not induce vomiting unless specifically instructed by a veterinary professional.",
            "Do not give random home remedies.",
            "Do not wait for symptoms after a potentially dangerous exposure."
        ],

        "red_flags": [
            "Seizures",
            "Collapse",
            "Difficulty breathing",
            "Severe weakness",
            "Loss of consciousness"
        ],

        "vet_required": True
    },


    # ============================================================
    # 4. ALLERGIC REACTION
    # ============================================================
    "allergic_reaction": {
        "name": "Allergic Reaction",
        "severity": "high",

        "keywords": [
            "allergy",
            "allergic",
            "allergic reaction",
            "reaction",
            "swelling",
            "swollen face",
            "swollen muzzle",
            "facial swelling",
            "face is swollen",
            "face looks swollen",
            "hives",
            "itching",
            "very itchy",
            "insect bite",
            "muzzle swelling",
            "red bumps",
            "bumps on skin"
        ],

        "immediate_actions": [
            "Remove the suspected exposure if it can be done safely.",
            "Monitor the pet closely.",
            "Contact a veterinarian for significant reactions."
        ],

        "avoid": [
            "Do not give human medication unless instructed by a veterinarian.",
            "Do not ignore facial swelling or breathing changes."
        ],

        "red_flags": [
            "Difficulty breathing",
            "Rapidly increasing swelling",
            "Collapse",
            "Severe weakness"
        ],

        "vet_required": True
    },


    # ============================================================
    # 5. PAW INJURY
    # ============================================================
    "paw_injury": {
        "name": "Paw Injury",
        "severity": "medium",

        "keywords": [
            "paw injury",
            "injured paw",
            "paw is injured",
            "paw got injured",
            "paw cut",
            "cut on paw",
            "cut on his paw",
            "cut on her paw",
            "cut on the paw",
            "paw wound",
            "wound on paw",
            "wound on his paw",
            "wound on her paw",
            "wound on the paw",
            "hurt paw",
            "paw hurts",
            "paw is hurt",
            "torn nail",
            "broken nail",
            "burned paw",
            "burnt paw",
            "burn on paw",
            "something stuck in paw",
            "something stuck in his paw",
            "something stuck in her paw",
            "object stuck in paw",
            "injury to paw"
        ],

        "immediate_actions": [
            "Restrict excessive walking.",
            "Inspect the paw only if it is safe.",
            "Control bleeding if present.",
            "Seek veterinary care for deep wounds or embedded objects."
        ],

        "avoid": [
            "Do not pull deeply embedded objects.",
            "Do not allow excessive licking or chewing.",
            "Do not use irritating household chemicals."
        ],

        "red_flags": [
            "Heavy bleeding",
            "Deep wound",
            "Severe swelling",
            "Unable to use the paw",
            "Embedded object"
        ],

        "vet_required": True
    },


    # ============================================================
    # 6. LIMPING / SUSPECTED INJURY
    # ============================================================
    "limping_injury": {
        "name": "Limping / Suspected Injury",
        "severity": "high",

        "keywords": [
            "limping",
            "limp",
            "is limping",
            "started limping",
            "walking with a limp",
            "can't walk",
            "cannot walk",
            "unable to walk",
            "not putting weight",
            "not bearing weight",
            "can't put weight",
            "cannot put weight",
            "unable to put weight",
            "leg injury",
            "injured leg",
            "hurt leg",
            "leg is hurt",
            "broken leg",
            "fracture",
            "injured limb",
            "hurt limb"
        ],

        "immediate_actions": [
            "Restrict activity.",
            "Prevent running and jumping.",
            "Handle the pet carefully.",
            "Seek veterinary assessment for severe or persistent limping."
        ],

        "avoid": [
            "Do not force the pet to walk.",
            "Do not attempt to straighten a suspected fracture.",
            "Do not give medication without veterinary guidance."
        ],

        "red_flags": [
            "Cannot use the limb",
            "Visible deformity",
            "Severe swelling",
            "Severe pain",
            "Major trauma"
        ],

        "vet_required": True
    },


    # ============================================================
    # 7. EYE ISSUES
    # ============================================================
    "eye_issue": {
        "name": "Eye Issues",
        "severity": "high",

        "keywords": [
            "eye injury",
            "eye problem",
            "eye issue",
            "eye is red",
            "eyes are red",
            "red eye",
            "red eyes",
            "eye redness",
            "redness in eye",
            "eye is swollen",
            "eyes are swollen",
            "swollen eye",
            "swollen eyes",
            "eye swelling",
            "red and swollen eye",
            "eye is red and swollen",
            "eye looks swollen",
            "eye looks red",
            "eye discharge",
            "discharge from eye",
            "watery eye",
            "watery eyes",
            "squinting",
            "squinting eye",
            "keeps squinting",
            "something in eye",
            "something stuck in eye",
            "foreign object in eye"
        ],

        "immediate_actions": [
            "Prevent the pet from rubbing the eye.",
            "Seek veterinary assessment for eye injuries or persistent symptoms."
        ],

        "avoid": [
            "Do not force the eye open.",
            "Do not remove embedded objects.",
            "Do not use human eye medication without veterinary advice."
        ],

        "red_flags": [
            "Severe trauma",
            "Protruding eye",
            "Sudden vision problems",
            "Severe pain",
            "Embedded foreign object"
        ],

        "vet_required": True
    },


    # ============================================================
    # 8. HEAT-CYCLE GUIDANCE
    # ============================================================
    "heat_cycle": {
        "name": "Heat-Cycle Guidance",
        "severity": "normal_or_concerning",

        "keywords": [
            "heat cycle",
            "heat cycle started",
            "in heat",
            "is in heat",
            "female heat",
            "heat period",
            "heat symptoms",
            "during heat",
            "dog is in heat",
            "female dog is in heat",
            "my dog is in heat",
            "heat season"
        ],

        "immediate_actions": [
            "Keep the female pet secure.",
            "Monitor physical and behavioral changes.",
            "Maintain appropriate hygiene."
        ],

        "avoid": [
            "Do not ignore unusual or severe symptoms."
        ],

        "red_flags": [
            "Excessive bleeding",
            "Foul-smelling discharge",
            "Severe lethargy",
            "Vomiting",
            "Abdominal pain",
            "Refusal to eat or drink"
        ],

        "vet_required": False
    }
}