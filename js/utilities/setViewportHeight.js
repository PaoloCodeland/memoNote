function documentHeight() {
    const doc = document.documentElement;
    doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
}

export default () => {
    documentHeight();
    window.addEventListener('resize', documentHeight);
};
