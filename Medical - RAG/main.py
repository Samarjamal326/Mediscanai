from dotenv import load_dotenv
load_dotenv()

from src.chain import ask

def main():
    print("[*] Medical RAG System — Python + Gemini")
    print("Type 'exit' or 'quit' to stop.\n")
    print("=" * 50)

    # Initialize Chat Memory
    chat_history = []

    while True:
        try:
            # Ask for user input
            question = input("\n[User]: ").strip()
            
            # Check for exit commands
            if question.lower() in ['exit', 'quit']:
                print("\n[*] Goodbye!")
                break
                
            # Skip empty inputs
            if not question:
                continue

            # Get answer from the RAG pipeline, passing in chat history
            answer = ask(question, chat_history)
            
            print(f"\n MediBot:\n{answer}")
            print("\n" + "=" * 50)

            # Save to chat history
            chat_history.append({"user": question, "bot": answer})

            # Keep history manageable (last 5 interactions)
            if len(chat_history) > 5:
                chat_history.pop(0)

        except KeyboardInterrupt:
            # Handle Ctrl+C gracefully
            print("\n[*] Goodbye!")
            break
        except Exception as e:
            print(f"\n Error: {e}")

if __name__ == "__main__":
    main()
