from typing import List
import json

def read_all_filters() -> str:
    """
    부품 카테고리에 따른 필터 리스트 반환
    Args:

    Returns:
        str: 부품 카테고리에 따른 필터 딕셔너리 전체
    """
    file_path = f"app/data/filter_dict.json"
    with open(file_path, "r", encoding="utf-8") as json_file:
        data = json.load(json_file)
    return json.dumps(data, ensure_ascii=False, indent=4)


def read_one_filter(category: str) -> str:
    """
    부품 카테고리에 따른 필터 리스트 반환
    Args:
        category (str): 부품 카테고리
    Returns:
        str: 부품 카테고리에 따른 필터 리스트
    """
    file_path = f"app/data/filter_dict.json"
    with open(file_path, "r", encoding="utf-8") as json_file:
        data = json.load(json_file)
    return data.get(category, [])