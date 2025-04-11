// 🧠 React ICD-10 Clinical Text Analyzer
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const icdData = [
  { Code: "A00", Description: "Cholera" },
  { Code: "B01", Description: "Varicella [chickenpox]" },
  { Code: "C34", Description: "Malignant neoplasm of bronchus and lung" },
  { Code: "D50", Description: "Iron deficiency anemia" },
  { Code: "E11", Description: "Type 2 diabetes mellitus" }
];

const buildMedicalVocab = (data) => {
  const vocab = new Set();
  data.forEach((entry) => {
    const words = entry.Description.toLowerCase().replace(/[\[\],]/g, "").split(" ");
    words.forEach((word) => {
      if (word.length > 3) vocab.add(word);
    });
  });
  return Array.from(vocab);
};

const getCloseMatches = (word, vocab) => {
  const threshold = 0.8;
  const matches = vocab.filter((v) => {
    let matchScore = 0;
    for (let i = 0; i < Math.min(v.length, word.length); i++) {
      if (v[i] === word[i]) matchScore++;
    }
    return matchScore / word.length >= threshold;
  });
  return matches.length ? matches[0] : null;
};

const mapToICD10 = (term) => {
  const direct = icdData.find((entry) =>
    entry.Description.toLowerCase().includes(term.toLowerCase())
  );
  if (direct) return direct;

  const vocab = icdData.map((e) => e.Description.toLowerCase());
  const close = getCloseMatches(term.toLowerCase(), vocab);
  if (close) return icdData.find((e) => e.Description.toLowerCase() === close);

  return null;
};

export default function App() {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const medicalVocab = buildMedicalVocab(icdData);

  const analyzeText = () => {
    const tokens = text.toLowerCase().split(/\W+/);
    const analyzed = [];

    tokens.forEach((word) => {
      if (word.length < 4) return;
      if (medicalVocab.includes(word)) {
        const entry = mapToICD10(word);
        if (entry) analyzed.push({ word, ...entry });
        else analyzed.push({ word, suggestion: null });
      } else {
        const suggestion = getCloseMatches(word, medicalVocab);
        analyzed.push({ word, suggestion });
      }
    });

    setResults(analyzed);
  };

  const searchICD = () => {
    const lowerTerm = searchTerm.toLowerCase();
    const matches = icdData.filter(
      (entry) =>
        entry.Description.toLowerCase().includes(lowerTerm) ||
        entry.Code.toLowerCase().includes(lowerTerm)
    );
    setSearchResults(matches);
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">ICD-10 Clinical Text Analyzer</h1>
      <Textarea
        placeholder="Enter clinical text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[100px]"
      />
      <Button onClick={analyzeText}>Analyze Text</Button>

      {results.length > 0 && (
        <Card>
          <CardContent className="space-y-2 pt-4">
            <h2 className="text-xl font-semibold">Results:</h2>
            {results.map((res, idx) => (
              <div key={idx}>
                {res.Code ? (
                  <p>
                    ✅ <strong>{res.word}</strong> → {res.Code} – {res.Description}
                  </p>
                ) : res.suggestion ? (
                  <p>
                    ❌ <strong>{res.word}</strong> not found – Did you mean <em>{res.suggestion}</em>?
                  </p>
                ) : (
                  <p>
                    ❌ <strong>{res.word}</strong> not found and no suggestions.
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="pt-6">
        <h2 className="text-xl font-semibold">Search ICD-10</h2>
        <div className="flex space-x-2 pt-2">
          <Input
            placeholder="Search by code or keyword"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={searchICD}>Search</Button>
        </div>
        {searchResults.length > 0 && (
          <ul className="pt-4 list-disc list-inside">
            {searchResults.map((res, idx) => (
              <li key={idx}>
                {res.Code} – {res.Description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
