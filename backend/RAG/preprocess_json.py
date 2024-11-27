import json
from openai import OpenAI
import numpy as np
import tiktoken
from dotenv import load_dotenv

load_dotenv()

# tiktoken 기반 토큰 제한 함수
def truncate_text(text, model="text-embedding-ada-002", max_tokens=8192):
    """
    텍스트를 토큰 수 기준으로 자르는 함수.
    
    Args:
        text (str): 입력 텍스트.
        model (str): 사용할 OpenAI 모델.
        max_tokens (int): 최대 허용 토큰 수.
    
    Returns:
        str: 잘라낸 텍스트.
    """
    # 모델에 맞는 tiktoken 인코더 로드
    encoder = tiktoken.encoding_for_model(model)
    
    # 텍스트를 토큰으로 변환
    tokens = encoder.encode(text)
    
    # 토큰 길이가 초과하면 자르기
    if len(tokens) > max_tokens:
        tokens = tokens[:max_tokens]  # 최대 토큰 길이로 자름
    
    # 토큰을 다시 텍스트로 디코딩
    truncated_text = encoder.decode(tokens)
    return truncated_text
# OpenAI Embedding 함수
def get_openai_embedding(text):
    client = OpenAI()
    
    # 텍스트 길이 제한
    text = truncate_text(text, max_tokens=8192)

    # OpenAI API 호출
    response = client.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding


# 가중합 임베딩 함수
def get_weighted_embedding(title, content, replies, weights):
    title_embedding = get_openai_embedding(title)
    content_embedding = get_openai_embedding(content)
    replies_embedding = get_openai_embedding(" ".join(replies)) if replies else np.zeros(len(title_embedding))

    weighted_embedding = (
        np.array(title_embedding) * weights["title"] +
        np.array(content_embedding) * weights["content"] +
        np.array(replies_embedding) * weights["replies"]
    )
    print(len(weighted_embedding))
    return weighted_embedding.tolist()

# 실행
input_file = "RAG/quasar_content_data2.json"  # 입력 JSON 파일 경로
output_file = "output2.json"  # 출력 JSON 파일 경로

def process_json_with_intermediate_saves(input_file, output_file, save_interval=400):
    weights = {"title": 0.2, "content": 0.3, "replies": 0.5}  # 가중치 설정

    with open(input_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    processed_data = []
    for idx, item in enumerate(data):
        title = item.get("Title", "")
        content = item.get("Content", "")
        replies = item.get("Reply", [])
        date = item.get("Date", "")
        website = item.get("Website", "")
        link = item.get("Link", "")

        # OpenAI를 사용한 가중합 임베딩 생성
        embedding = get_weighted_embedding(title, content, replies, weights)

        # 변환된 형식 생성
        formatted_item = {
            "Title": title,
            "Content": content,
            "Reply": replies,
            "Metadata": {
                "Date": date,
                "Website": website,
                "Link": link
            },
            "Embedding": embedding
        }
        processed_data.append(formatted_item)
        print(f"Processed document {idx + 1}/{len(data)}")

        # 중간 저장
        if (idx + 1) % save_interval == 0:
            intermediate_output_file = f"{output_file.split('.')[0]}_part{(idx + 1) // save_interval}.json"
            with open(intermediate_output_file, "w", encoding="utf-8") as file:
                json.dump(processed_data, file, indent=4, ensure_ascii=False)
            print(f"Intermediate data saved to {intermediate_output_file}")
            processed_data = []  # 중간 저장 후 리스트 초기화

    # 남은 데이터 저장
    if processed_data:
        final_output_file = f"{output_file.split('.')[0]}_final.json"
        with open(final_output_file, "w", encoding="utf-8") as file:
            json.dump(processed_data, file, indent=4, ensure_ascii=False)
        print(f"Final data saved to {final_output_file}")

process_json_with_intermediate_saves(input_file, output_file)