from pydantic import BaseModel


class PersonBase(BaseModel):
    id: str
    name: str
    birth_year: int | None = None


class PersonDetail(PersonBase):
    movies_acted: list["MovieRef"] = []
    movies_directed: list["MovieRef"] = []


class PersonSearchResult(BaseModel):
    results: list[PersonBase]
    total: int


class MovieRef(BaseModel):
    id: str
    title: str
    release_year: int | None = None
    role: str | None = None


# Rebuild forward refs
PersonDetail.model_rebuild()
