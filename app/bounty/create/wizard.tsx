"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BountyCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [bountyType, setBountyType] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const handleNextStep1 = () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleCreate = async () => {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationName: "CreateBounty",
        variables: {
          input: {
            title,
            description,
            organization,
            githubUrl,
            bountyType,
            rewardAmount: Number(rewardAmount),
            currency,
            deadline,
          },
        },
      }),
    });
    const { data } = await res.json();
    if (data?.createBounty?.id) {
      router.push(`/bounty/${data.createBounty.id}`);
    }
  };

  return (
    <div className="p-4 border rounded">
      {step === 1 && (
        <div>
          <h2>Step 1</h2>
          {error && <div className="text-red-500">{error}</div>}
          <div className="mb-4">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className="border p-2 w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="border p-2 w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="organization">Organization</label>
            <select
              id="organization"
              className="border p-2 w-full"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            >
              <option value="">Select an organization</option>
              <option value="org-1">Stellar Privacy Lab</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="githubUrl">GitHub URL</label>
            <input
              id="githubUrl"
              type="url"
              className="border p-2 w-full"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bountyType">Bounty Type</label>
            <select
              id="bountyType"
              className="border p-2 w-full"
              value={bountyType}
              onChange={(e) => setBountyType(e.target.value)}
            >
              <option value="">Select a bounty type</option>
              <option value="fixed">Fixed Price</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
          <button
            onClick={handleNextStep1}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2</h2>
          <div className="mb-4">
            <label htmlFor="rewardAmount">Reward Amount</label>
            <input
              id="rewardAmount"
              type="number"
              className="border p-2 w-full"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              className="border p-2 w-full"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="">Select currency</option>
              <option value="XLM">XLM</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              type="date"
              className="border p-2 w-full"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <button
            onClick={() => setStep(1)}
            className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
          >
            Back
          </button>
          <button
            onClick={handleNextStep2}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3</h2>
          <div className="mb-4">
            <p>
              <strong>Title:</strong> {title}
            </p>
            <p>
              <strong>Reward:</strong> {rewardAmount} {currency}
            </p>
          </div>
          <button
            onClick={() => setStep(2)}
            className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
          >
            Back
          </button>
          <button
            onClick={handleCreate}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Bounty
          </button>
        </div>
      )}
    </div>
  );
}
