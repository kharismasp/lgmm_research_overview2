// Each data-slide-step marks a whole card, figure, or other layout unit.
export function createSlideBuilds(chapters) {
  const slides = new Map(chapters.map(chapter => {
    const groups = [[]];
    for (const unit of chapter.querySelectorAll('[data-slide-step]')) {
      const index = Number(unit.dataset.slideStep);
      (groups[index] ??= []).push(unit);
    }
    return [chapter, {step:0, groups}];
  }));

  function render(slide, active, entering = -1) {
    slide.groups.forEach((units,index) => {
      const hidden = active && index > slide.step;
      for (const unit of units) {
        unit.inert = hidden;
        unit.toggleAttribute('data-build-hidden',hidden);
        if (!active || hidden) unit.removeAttribute('data-build-enter');
        else if (index === entering) unit.setAttribute('data-build-enter','');
      }
    });
  }

  for (const chapter of chapters) {
    chapter.addEventListener('animationend', event => {
      if (event.animationName === 'slide-build-arrive') event.target.removeAttribute('data-build-enter');
    });
  }

  function finish(chapter) {
    chapter?.querySelectorAll('[data-build-enter]').forEach(unit => unit.removeAttribute('data-build-enter'));
  }

  return {
    finish,
    setMode(active,current) {
      for (const [chapter,slide] of slides) {
        slide.step = 0;
        render(slide,active,active && chapter === current ? 0 : -1);
      }
    },
    restart(chapter) {
      const slide = slides.get(chapter);
      slide.step = 0;
      render(slide,true,0);
    },
    count(chapter) {
      const {step,groups} = slides.get(chapter);
      return {visible:step + 1, total:groups.length};
    },
    advance(chapter,direction) {
      const slide = slides.get(chapter);
      const step = slide.step + direction;
      if (step < 0 || step >= slide.groups.length) return null;
      slide.step = step;
      render(slide,true,direction > 0 ? step : -1);
      return slide.groups[step];
    },
    showAll(chapter) {
      const slide = slides.get(chapter);
      slide.step = slide.groups.length - 1;
      finish(chapter);
      render(slide,true);
    }
  };
}
