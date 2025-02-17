export const searchPrograms = async (query: string) => {
    const response = await fetch(`/api/search?query=${query}`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};
