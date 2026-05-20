// TODO: will move this up since its gonna be used in all mock api functions
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
