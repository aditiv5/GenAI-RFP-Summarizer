import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
import concurrent.futures
from utils import num_tokens_from_string, summarize_text_with_bedrock

def chunk_and_summarize_text(extracted_text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=50000,
        chunk_overlap=100,
        length_function=len
    )
    chunks = text_splitter.split_text(extracted_text)

    chunk_summaries = [""] * len(chunks)

    with concurrent.futures.ThreadPoolExecutor(max_workers=9) as executor:
        future_to_chunk = {executor.submit(summarize_chunk, chunk, i+1): i for i, chunk in enumerate(chunks)}

        for future in concurrent.futures.as_completed(future_to_chunk):
            chunk_index = future_to_chunk[future]
            try:
                chunk_summary = future.result()
                chunk_summaries[chunk_index] = chunk_summary
            except Exception as exc:
                print(f"Chunk {chunk_index+1} generated an exception: {exc}")

    combined_summary = "\n\n ".join(chunk_summaries)
    #final_summary = summarize_combined_summary(combined_summary)
    final_summary = combined_summary
    print("Final summary is generated")

    return final_summary if final_summary else "Unable to generate final summary"

def summarize_chunk(chunk, chunk_number):
    try:
        print(f"Summarizing chunk {chunk_number} with {num_tokens_from_string(chunk)} tokens...")

        chunk_prompt = (
    f"You are an AI designed to perform detailed summarization on large RFP (Request for Proposal) and EOI (Expression of Interest) documents. "
    f"You will be given a specific chunk or section of an RFP or EOI, and your task is to extract and summarize all key information, ensuring that **no numerical data is lost or omitted**. "
    
    f"Highlight the main objectives, requirements, evaluation criteria, bidder information, any Pre-Qualification Criteria, Qualification Criteria, Eligibility Criteria, and Technical Criteria, along with any required supporting documents. "
    f"Pay special attention to any numerical details such as quantities, deadlines, budgets, and performance metrics. All numerical data must be included exactly as it appears in the original text. "
    f"If any of these criteria or numerical details appear in other sections, make sure to include them as well. Extract related conditions or requirements even if they are not explicitly part of the current section. "
    
    f"Summarize the following section of the RFP by directly presenting the key points. If no heading is present in the content, create one based on the context. Here is the text: {chunk} "
    
    f"\n\n1. Abbreviations & Definitions\n"
    f"**Provide all abbreviations used in the RFP and their corresponding definitions for clarity.** "
    
    f"\n2. Invitation to Bid\n"
    f"**Detail the process for bidding, including who can bid, the deadline for submission, and where to submit bids.** "
    
    f"\n3. Fact Sheet\n"
    f"**A brief overview of the project, key timelines, and contact information.** "
    
    f"\n4. Project Background\n"
    f"**Explain the context of the project, including historical information and the need for the proposed solution.** "
    
    f"\n5. Purpose of the Bid\n"
    f"**Clearly state the objectives and goals of the bid, including what the client aims to achieve.** "
    
    f"\n6. Instructions to Bidders\n"
    f"**Detailed instructions on how to prepare and submit the bid, including formatting, required documents, and submission method.** "
    
    f"\n7. Key Requirements of the Bid\n"
    f"**List the specific requirements that must be met for the bid to be considered compliant, including technical, functional, and operational requirements.** "
    
    f"\n8. Proposal Submission Guidelines\n"
    f"**Detail the process for proposal submission, including deadlines, method of submission, and required format.** "
    
    f"\n9. Bid Security / Earnest Money Deposit\n"
    f"**Specify any financial guarantees required for bid submission, including amounts and acceptable forms.** "
    
    f"\n10. Bid Validity\n"
    f"**State the duration for which the bid is valid and any conditions that might affect this validity period.** "
    
    f"\n11. Authorized Signatory\n"
    f"**Identify who is authorized to sign the proposal and any supporting documents on behalf of the bidder.** "
    
    f"\n12. Disqualification Criteria\n"
    f"**List conditions under which a bid may be disqualified, such as non-compliance with submission guidelines or failure to meet eligibility criteria.** "
    
    f"\n13. Confidentiality\n"
    f"**Outline any confidentiality requirements regarding the proposal and any proprietary information.** "
    
    f"\n14. Purchaser’s Rights\n"
    f"**Explain the rights of the purchaser regarding the acceptance or rejection of bids.** "
    
    f"\n15. Consortiums\n"
    f"**Detail any provisions for bidders to form consortiums, including eligibility and submission requirements.** "
    
    f"\n16. Evaluation Process and Criteria\n"
    f"**Describe the evaluation methodology that will be used to assess bids, including criteria and scoring mechanisms.** "
    
    f"\n17. Service Level Agreements (SLAs) & Penalties\n"
    f"**Specify the SLAs expected from the contractor and any penalties for non-compliance.** "
    
    f"\n18. Award of Contract\n"
    f"**Outline the criteria for awarding the contract and the process involved.** "
    
    f"\n19. Billing & Payment\n"
    f"**Provide details on the billing process, payment terms, and any conditions related to financial transactions.** "
    
    f"\n20. Special Conditions of Contract\n"
    f"**Outline any unique conditions that will apply to the contract.** "
    
    f"\n21. General Obligations\n"
    f"**Detail the general obligations of the contractor throughout the project lifecycle.** "
    
    f"\n22. Technical Requirements\n"
    f"**Detail the specific technical requirements that must be met by the bidder, including software and hardware specifications, integration needs, and any compliance standards.** "
    
    f"\n23. Scope of Work (SoW)\n"
    f"**Define the overall scope of work, including deliverables and responsibilities.** "
    
    f"\n24. Contract Period & Service Details\n"
    f"**Specify the duration of the contract and the details of services to be provided.** "
    
    f"\n25. End of Contract Deliverables\n"
    f"**Detail the expected deliverables at the end of the contract period, including documentation and any required reports.** "
    
    f"\n26. Service Location\n"
    f"**Specify where the services will be performed or delivered.** "
    
    f"\n27. Contract Signatures\n"
    f"**Detail the process for contract signing, including who will sign on behalf of each party.** "
)

        chunk_summary_response = summarize_text_with_bedrock(chunk_prompt)

        if chunk_summary_response:
            print(f"Chunk {chunk_number} summary response received.")
            return chunk_summary_response
        else:
            print(f"Failed to summarize chunk {chunk_number}, no response.")
            return ""

    except Exception as e:
        print(f"Chunk {chunk_number} generated an exception: {str(e)}")
        return ""


# def summarize_combined_summary(combined_summary):
#     final_summary_prompt = (
#     f"Please enhance the following large RFP (Request for Proposal) or EOI (Expression of Interest) by improving its structure and readability. "
#     f"Ensure that **none of the information** is lost or omitted. "
#     f"Organize the content with appropriate headings, bullet points, or sections, and refine the language for clarity and flow. "
#     f"Preserve all key details, but present them in a more structured and coherent way, making the summary easy to read and understand. "
#     f"Here is the combined summary: {combined_summary}"
#     )
    
#     return summarize_text_with_bedrock(final_summary_prompt)
