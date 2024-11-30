import React, { useState } from 'react';
import openai from './openai';

const IdeaGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [thoughtProcess, setThoughtProcess] = useState<string[]>([]);
  const [finalIdea, setFinalIdea] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleGenerateIdea = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setThoughtProcess([]);
    setFinalIdea(null);
    setError(null);

    try {
      const bestIdea = await generateBestIdea(topic);
      setFinalIdea(bestIdea);
    } catch (err) {
      console.error('Error generating idea:', err);
      setError('An error occurred while generating the idea. Please try again.');
    }

    setIsLoading(false);
  };

  const generateBestIdea = async (originalTopic: string): Promise<string> => {
    let currentTopic = originalTopic;
    const process: string[] = [];

    for (let iteration = 0; iteration < 10; iteration++) { // 3 iterations
      process.push(`**Iteration ${iteration + 1}:** Generating options for topic: "${currentTopic}"`);
      setThoughtProcess([...process]);

      // Generate options
      const generationPrompt = iteration === 0
        ? `Generate 3 creative and feasible ideas for the topic: "${currentTopic}" while keeping the original goal in mind.`
        : `Generate 3 variations of the previously selected best idea: "${currentTopic}". Ensure that these variations stay true to the original goal: "${originalTopic}" and improve upon the previous idea.`;

      const generationResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant generating multiple innovative ideas while keeping the original goal in mind.' },
          { role: 'user', content: generationPrompt },
        ],
      });

      const generatedOptions = generationResponse.choices[0].message?.content || '';
      process.push(`Generated options:\n${generatedOptions}`);
      process.push(`**Iteration ${iteration + 1}:** Selecting the best idea from the generated options.`);
      setThoughtProcess([...process]);

      // Select the best option
      const selectionResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant that selects the single best idea while keeping the original goal in mind.' },
          {
            role: 'user',
            content: `Original goal: "${originalTopic}"\n\nSelect the best idea from these options: ${generatedOptions}`,
          },
        ],
      });

      const bestIdea = selectionResponse.choices[0].message?.content || '';
      process.push(`Selected best idea:\n${bestIdea}`);
      setThoughtProcess([...process]);

      await delay(5000); // Delay before the next iteration
      currentTopic = bestIdea; // Use the best idea as the input for the next iteration
    }

    return currentTopic; // Return the final best idea
  };

  return (
    <div className="idea-generator">
      <h1>Oscillating Creativity Machine</h1>
      <input
        type="text"
        placeholder="Enter a topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button onClick={handleGenerateIdea} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Idea'}
      </button>
      {error && <div className="error-message">{error}</div>}
      {thoughtProcess.length > 0 && (
        <div className="thought-process">
          <h2>Thought Process:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{thoughtProcess.join('\n\n')}</pre>
        </div>
      )}
      {finalIdea && (
        <div className="final-idea">
          <h2>Final Idea:</h2>
          <p>{finalIdea}</p>
        </div>
      )}
    </div>
  );
};

export default IdeaGenerator;
