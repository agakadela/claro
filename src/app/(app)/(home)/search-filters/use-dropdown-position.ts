export function useDropdownPosition(
  dropdownRef: React.RefObject<HTMLDivElement | null>
) {
  function getDropdownPosition() {
    if (!dropdownRef.current) return { top: 0, left: 0 };

    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownWidth = 240;

    let left = rect.left + window.scrollX;
    const top = rect.bottom + window.scrollY;

    if (left + dropdownWidth > window.innerWidth) {
      left = rect.right + window.scrollX - dropdownWidth;

      if (left < 0) {
        left = window.innerWidth - dropdownWidth - 16;
      }
    }

    if (left < 0) {
      left = 16;
    }

    return { top, left };
  }

  return { getDropdownPosition };
}
