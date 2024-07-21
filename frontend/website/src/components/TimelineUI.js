import React, { useRef, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import * as d3 from 'd3';

const TimelineUI = () => {
  const ref = useRef();

  //timeline setup
  useEffect(() => {
    // Sample data
    const data = [
      { date: new Date(2000, 1, 1), event: 'Event 1' },
      { date: new Date(2020, 3, 1), event: 'Event 2' },
      { date: new Date(2020, 6, 1), event: 'Event 3' },
      { date: new Date(2020, 9, 1), event: 'Event 4' },
    ];

    // define margins and dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1260 - margin.left - margin.right;
    const height = 180 - margin.top - margin.bottom;

    // adding attributes to ref.current
    const svg = d3.select(ref.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Clear any existing content
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(zoom);

    const circles = g.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', height / 2)
      .attr('r', 5);

    function zoomed(event) {
      const transform = event.transform;
      const newX = transform.rescaleX(x);
      xAxis.call(d3.axisBottom(newX));
      circles.attr('cx', d => newX(d.date));
    }

  }, []);

  return (
    <Paper elevation={3} style={{ height: '90%', width: '100%', padding: '20px', margin: '0px' }}>
      <svg ref={ref}></svg>
    </Paper>
  );
};

export default TimelineUI;
