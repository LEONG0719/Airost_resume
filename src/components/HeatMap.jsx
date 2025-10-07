import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function HeatMap({ data, width = 400, height = 200 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.day))
      .range([0, innerWidth])
      .padding(0.05);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.hour))
      .range([0, innerHeight])
      .padding(0.05);

    const color = d3
      .scaleSequential(d3.interpolateOrRd)
      .domain([0, d3.max(data, (d) => d.value)]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.day))
      .attr('y', (d) => y(d.hour))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', (d) => color(d.value));
  }, [data, width, height]);

  return <svg ref={ref} width={width} height={height}></svg>;
}

export default HeatMap;
