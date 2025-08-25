import os
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq

class LLMService:
    """
    LLM Service that replicates the RetrievalQA functionality
    from connect_memory_with_llm.py
    """
    
    def __init__(self):
        self.custom_prompt_template = """
        Use the pieces of information provided in the context to answer user's question.
        If you dont know the answer, just say that you dont know, dont try to make up an answer. 
        Dont provide anything out of the given context

        Context: {context}
        Question: {question}

        Start the answer directly. No small talk please.
        """
    
    def _set_custom_prompt(self, custom_prompt_template):
        """Create and return a PromptTemplate"""
        prompt = PromptTemplate(
            template=custom_prompt_template, 
            input_variables=["context", "question"]
        )
        return prompt
    
    def _get_llm(self):
        """Initialize and return the ChatGroq LLM"""
        try:
            llm = ChatGroq(
                model_name="meta-llama/llama-4-maverick-17b-128e-instruct",  # free, fast Groq-hosted model
                temperature=0.0,
                groq_api_key=os.environ["GROQ_API_KEY"],
            )
            return llm
        except Exception as e:
            raise Exception(f"Failed to initialize LLM: {str(e)}")
    
    def get_response(self, query, vectorstore):
        """
        Get response from the RetrievalQA chain
        Replicates the qa_chain functionality from connect_memory_with_llm.py
        """
        try:
            # Create the RetrievalQA chain
            qa_chain = RetrievalQA.from_chain_type(
                llm=self._get_llm(),
                chain_type="stuff",
                retriever=vectorstore.as_retriever(search_kwargs={'k': 3}),
                return_source_documents=True,
                chain_type_kwargs={'prompt': self._set_custom_prompt(self.custom_prompt_template)}
            )
            
            # Get response from the chain
            response = qa_chain.invoke({'query': query})
            
            return response
            
        except Exception as e:
            raise Exception(f"Failed to get LLM response: {str(e)}")
    
    def update_prompt_template(self, new_template):
        """Update the custom prompt template"""
        self.custom_prompt_template = new_template
