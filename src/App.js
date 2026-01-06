import React, { useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL;


const InputNode = ({ data }) => {
  return (
    <div className="custom-node input-node">
      <div className="node-header">📝 Input Prompt</div>

      <textarea
        className="node-textarea nodrag"
        value={data.value}
        onChange={data.onChange}
        placeholder="Type your question here..."
        rows={4}
      />
    </div>
  );
};

const ResultNode = ({ data }) => {
  return (
    <div className="custom-node result-node">
      <div className="node-header">🤖 AI Response</div>
      <div className="node-content">
        {data.loading ? (
          <div className="loading">Loading...</div>
        ) : data.value ? (
          <p>{data.value}</p>
        ) : (
          <p className="placeholder">Response will appear here...</p>
        )}
      </div>
    </div>
  );
};


const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");


  const initialNodes = [
    {
      id: "1",
      type: "inputNode",
      position: { x: 100, y: 100 },
      data: {
        value: prompt,
        onChange: (e) => setPrompt(e.target.value),
      },
    },
    {
      id: "2",
      type: "resultNode",
      position: { x: 500, y: 100 },
      data: {
        value: response,
        loading: loading,
      },
    },
  ];


  const initialEdges = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      animated: true,
      style: { stroke: "#4CAF50", strokeWidth: 2 },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

 
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1") {
          return {
            ...node,
            data: {
              ...node.data,
              value: prompt,
              onChange: (e) => setPrompt(e.target.value),
            },
          };
        }
        if (node.id === "2") {
          return {
            ...node,
            data: {
              value: response,
              loading: loading,
            },
          };
        }
        return node;
      })
    );
  }, [prompt, response, loading, setNodes]);


  const handleRunFlow = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first!");
      return;
    }

    setLoading(true);
    setResponse("");
    setSaveStatus("");

    try {
         const res = await axios.post(`${API_BASE}/api/ask-ai`, {
        prompt,
      });

      setResponse(res.data.response);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };


  const handleSaveFlow = async () => {
    if (!prompt.trim() || !response.trim()) {
      alert("Please run the flow first before saving!");
      return;
    }

    setSaveStatus("Saving...");

      try {
      await axios.post(`${API_BASE}/api/save-flow`, {
        prompt,
        response,
      });

      setSaveStatus("✅ Saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setSaveStatus("❌ Save failed");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AI Flow Builder</h1>
        <p>Ask AI anything and see the flow in action!</p>
      </header>

      <div className="controls-panel">
        <button
          className="btn btn-primary"
          onClick={handleRunFlow}
          disabled={loading}
        >
          {loading ? "⏳ Running..." : "▶️ Run Flow"}
        </button>

        <button
          className="btn btn-success"
          onClick={handleSaveFlow}
          disabled={!response || loading}
        >
          💾 Save to Database
        </button>

        {saveStatus && <span className="save-status">{saveStatus}</span>}
      </div>

      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      <footer className="App-footer">
        <p>Built with MERN Stack + React Flow + OpenRouter AI - Hasanul Banna</p>
      </footer>
    </div>
  );
}

export default App;
