import openai

# OpenAI API 키를 입력하세요
openai.api_key = ""

def ask_openai(question):
    try:
        # GPT-3.5-turbo 모델에 요청
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": question}]
        )
        # 응답 출력
        answer = response['choices'][0]['message']['content']
        return answer
    except Exception as e:
        return f"Error: {e}"

# 예제 질문
question = "Do you know the football teams participating in Champions league now?"
answer = ask_openai(question)
print("OpenAI's Answer:", answer)
