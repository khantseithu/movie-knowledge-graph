from pydantic import BaseModel


class MovieBase(BaseModel):
    id: str
    title: str
    release_year: int | None = None
    rating: float | None = None


class MovieDetail(MovieBase):
    genres: list[str] = []
    cast: list["PersonBase"] = []
    directors: list["PersonBase"] = []


class MovieSearchResult(BaseModel):
    results: list[MovieBase]
    total: int


class PersonBase(BaseModel):
    id: str
    name: str
    birth_year: int | None = None


# Rebuild forward refs
MovieDetail.model_rebuild()
