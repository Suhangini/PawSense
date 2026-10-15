
import React, { useState } from "react";
import "../styles/PostureGuidance.css";
import BackToDashboard from "../components/BackToDashboard";


// Cat posture images
import catStanding from "../assets/images/posture/cat/standing.webp";
import catSitting from "../assets/images/posture/cat/sitting.webp";
import catLying from "../assets/images/posture/cat/lying.webp";
import catWalking from "../assets/images/posture/cat/walking.webp";
import catHunched from "../assets/images/posture/cat/hunched.webp";
import catLimping from "../assets/images/posture/cat/limping.webp";
import catStiff from "../assets/images/posture/cat/stiff.webp";
import catDifficulty from "../assets/images/posture/cat/standing_difficulty.webp";
import catUnusualLying from "../assets/images/posture/cat/unusual_lying.webp";

// Dog posture images
import dogStanding from "../assets/images/posture/dog/standing.webp";
import dogSitting from "../assets/images/posture/dog/sitting.webp";
import dogLying from "../assets/images/posture/dog/lying.webp";
import dogWalking from "../assets/images/posture/dog/walking.webp";
import dogHunched from "../assets/images/posture/dog/hunched.webp";
import dogLimping from "../assets/images/posture/dog/limping.webp";
import dogStiff from "../assets/images/posture/dog/stiff.webp";
import dogDifficulty from "../assets/images/posture/dog/standing_difficulty.webp";
import dogUnusualLying from "../assets/images/posture/dog/unusual_lying.webp";

const postureData = {
  dog: {
    normal: [
      {
        title: "Standing",
        image: dogStanding,
        description:
          "Body upright, with weight evenly distributed across all four legs.",
      },
      {
        title: "Sitting",
        image: dogSitting,
        description:
          "Hind legs folded, front legs straight, and back in a relaxed position.",
      },
      {
        title: "Lying Down",
        image: dogLying,
        description:
          "Body relaxed on the floor, appearing comfortable and calm.",
      },
      {
        title: "Walking",
        image: dogWalking,
        description:
          "Smooth, balanced movement with coordinated leg movements.",
      },
    ],
    abnormal: [
      {
        title: "Hunched Back",
        image: dogHunched,
        description:
          "An arched back may indicate pain or discomfort, including abdominal pain.",
      },
      {
        title: "Limping",
        image: dogLimping,
        description:
          "Avoiding weight on one leg may indicate an injury, joint problem, or paw pain.",
      },
      {
        title: "Stiff Posture",
        image: dogStiff,
        description:
          "A stiff or rigid body can be associated with joint pain, muscle stiffness, or other problems.",
      },
      {
        title: "Difficulty Standing",
        image: dogDifficulty,
        description:
          "Trouble getting up or sitting down may indicate pain, weakness, or mobility problems.",
      },
      {
        title: "Unusual Lying",
        image: dogUnusualLying,
        description:
          "Persistent unusual lying positions or difficulty getting comfortable may indicate discomfort.",
      },
    ],
  },
  cat: {
    normal: [
      {
        title: "Standing",
        image: catStanding,
        description:
          "Body upright, with weight evenly distributed across all four legs.",
      },
      {
        title: "Sitting",
        image: catSitting,
        description:
          "A relaxed sitting position with front paws straight and back legs tucked.",
      },
      {
        title: "Lying Down",
        image: catLying,
        description:
          "Body relaxed on the floor, appearing comfortable and calm.",
      },
      {
        title: "Walking",
        image: catWalking,
        description:
          "Smooth, balanced movement with coordinated leg movements.",
      },
    ],
    abnormal: [
      {
        title: "Hunched Back",
        image: catHunched,
        description:
          "An arched back or hunched posture may indicate pain or abdominal discomfort.",
      },
      {
        title: "Limping",
        image: catLimping,
        description:
          "Favoring one leg or avoiding weight on a limb may indicate an injury or paw problem.",
      },
      {
        title: "Stiff Posture",
        image: catStiff,
        description:
          "A stiff or rigid body can be associated with joint pain, muscle stiffness, or other issues.",
      },
      {
        title: "Difficulty Standing",
        image: catDifficulty,
        description:
          "Trouble getting up or sitting down may indicate pain, weakness, or mobility problems.",
      },
      {
        title: "Unusual Lying",
        image: catUnusualLying,
        description:
          "Persistent unusual lying positions, restlessness, or hiding may indicate discomfort.",
      },
    ],
  },
};

function PostureCard({ posture, abnormal = false }) {
  return (
    <article className="posture-card">
      <div className="posture-image-wrap">
        <img
          className="posture-image"
          src={posture.image}
          alt={`${posture.title} posture in a pet`}
          loading="lazy"
        />
      </div>

      <div className="posture-card-content">
        <span
          className={`posture-label ${
            abnormal ? "posture-label-abnormal" : "posture-label-normal"
          }`}
        >
          {posture.title}
        </span>
        <p>{posture.description}</p>
      </div>
    </article>
  );
}

export default function PostureGuidance() {
  const [species, setSpecies] = useState("dog");
  const current = postureData[species];

  return (
    <main className="posture-page">
      <BackToDashboard />

      <header className="posture-page-header">
        <div>
          <span className="posture-eyebrow">PAWSENSE AI</span>
          <h1>Posture Guidance</h1>
          <p className="posture-subtitle">
            Learn about healthy postures, common signs to watch for, and how
            to keep your pet comfortable.
          </p>
        </div>

        <aside className="posture-intro-note">
          <span className="posture-note-icon" aria-hidden="true">💡</span>
          <div>
            <h3>Why Posture Matters?</h3>
            <p>
              Your pet's posture can offer clues about pain, comfort, and
              overall health. Recognizing changes early can help you seek
              timely veterinary care.
            </p>
          </div>
        </aside>
      </header>

      
      {/* Shared Dog/Cat selector */}
      <div className="posture-species-picker">
        <div
          className="species-toggle"
          role="group"
          aria-label="Choose pet species"
        >
          <button
            type="button"
            className={species === "dog" ? "active" : ""}
            aria-pressed={species === "dog"}
            onClick={() => setSpecies("dog")}
          >
            🐕 Dog
          </button>

          <button
            type="button"
            className={species === "cat" ? "active" : ""}
            aria-pressed={species === "cat"}
            onClick={() => setSpecies("cat")}
          >
            🐈 Cat
          </button>
        </div>
      </div>


      {/* Normal Postures */}
      <section className="posture-section">
        <div className="posture-section-header">
          <div className="posture-section-heading">
            <span className="posture-section-icon" aria-hidden="true">✅</span>
            <div>
              <h2>Normal Postures</h2>
              <p>Common, comfortable postures for your selected pet.</p>
            </div>
          </div>
        </div>

        <div className="posture-grid posture-grid-normal">
          {current.normal.map((posture) => (
            <PostureCard key={posture.title} posture={posture} />
          ))}
        </div>
      </section>

      {/* Abnormal Postures */}
      <section className="posture-section">
        <div className="posture-section-header">
          <div className="posture-section-heading">
            <span className="posture-section-icon posture-warning-icon" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h2>Common Abnormal Postures</h2>
              <p>
                These postures may indicate discomfort, pain, or health issues.
                Consult a veterinarian if you notice persistent changes.
              </p>
            </div>
          </div>
        </div>

        <div className="posture-grid posture-grid-abnormal">
          {current.abnormal.map((posture) => (
            <PostureCard key={posture.title} posture={posture} abnormal />
          ))}
        </div>
      </section>

      {/* Health Tips */}
      <section className="posture-tips">
        <div className="posture-tips-title">
          <span aria-hidden="true">💚</span>
          <h2>Tips for Better Posture &amp; Joint Health</h2>
        </div>

        <div className="posture-tips-grid">
          <div className="posture-tip">
            <span aria-hidden="true">⚖️</span>
            <p>Maintain a healthy weight to reduce joint stress.</p>
          </div>
          <div className="posture-tip">
            <span aria-hidden="true">🐕</span>
            <p>Provide regular exercise suited to your pet's needs.</p>
          </div>
          <div className="posture-tip">
            <span aria-hidden="true">🛏️</span>
            <p>Provide comfortable bedding and resting areas.</p>
          </div>
          <div className="posture-tip">
            <span aria-hidden="true">🐾</span>
            <p>Keep nails trimmed to support comfortable movement.</p>
          </div>
          <div className="posture-tip">
            <span aria-hidden="true">🩺</span>
            <p>Consult a veterinarian about persistent or sudden changes.</p>
          </div>
        </div>

        <p className="posture-disclaimer">
          This guide is for educational purposes only. Posture alone cannot
          diagnose a medical condition. Seek veterinary advice for concerning
          symptoms.
        </p>
      </section>
    </main>
  );
}
