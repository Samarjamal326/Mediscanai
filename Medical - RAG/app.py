from flask import Flask, request, jsonify
from flask_cors import CORS
from src.chain import ask

app = Flask(__name__)
# Enable CORS so the Node.js server or React frontend can call it
CORS(app)

@app.route('/api/rag-chat', methods=['POST'])
def rag_chat():
    try:
        data = request.json
        question = data.get('message', '')
        chat_history = data.get('history', [])
        
        if not question:
            return jsonify({"error": "Message is required"}), 400
            
        print(f"[*] Received RAG request: {question}")
        answer = ask(question, chat_history)
        
        return jsonify({
            "success": True,
            "answer": answer
        })
    except Exception as e:
        print(f"[*] Error processing RAG request: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("[*] Starting Medical RAG API on port 5001...")
    # Run on port 5001 to avoid conflicting with the Node.js server on 5000
    app.run(host='0.0.0.0', port=5001, debug=True)
