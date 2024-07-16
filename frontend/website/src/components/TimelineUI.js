import React, { useRef, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import * as d3 from 'd3';

const TimelineUI = () => {
  const ref = useRef();

  useEffect(() => {
    // Sample data for the timeline
    const data = [
      { date: new Date(2020, 1, 1), event: 'Event 1' },
      { date: new Date(2020, 3, 1), event: 'Event 2' },
      { date: new Date(2020, 6, 1), event: 'Event 3' },
      { date: new Date(2020, 9, 1), event: 'Event 4' },
    ];

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1260 - margin.left - margin.right;
    const height = 180 - margin.top - margin.bottom;


    //calculate the width and height of the svg
    // set width and height of the svg
    // create a group element to hold the chart
    // translate the group element to have padding for the left and top margins
    const svg = d3.select(ref.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      //translate the origin of the svg
      .attr('transform', `translate(${margin.left},${margin.top})`);

    //create the x-axis
    //create a time scale for the x-axis
    // domain is for time range
    // range is for the pixel range
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    //creates a bottom-oriented axis generator using the x scale.
    //input x(scale with given values) into the axisBottom function
    const xAxis = d3.axisBottom(x);

    //append a group element to the svg
    //call the xAxis function on the group element
    //translate the x-axis to the bottom of the svg
    const xAxisGroup = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);


    //create a zoom behavior
    //set the scale extent to 1 to 10
    //set the translate extent to the width and height of the svg
    //set the extent to the width and height of the svg
    //call the zoom function on the svg
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    //create a rectangle element to capture all the zoom events
    //set the width and height of the rectangle to the width and height of the svg
    //set the fill to none
    //set the pointer events to all
    //call the zoom function on the rectangle
    //append the rectangle to the svg
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(zoom);

    //create a circle element for each data point
    const circles = svg.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.date))
      .attr('cy', height / 2)
      .attr('r', 5)
      .attr('fill', 'blue');

    //create a text element for each data point
    const texts = svg.selectAll('text')
      .data(data)
      .join('text')
      .attr('x', d => x(d.date))
      .attr('y', height / 2 - 10)
      .attr('text-anchor', 'middle')


    function zoomed(event) {
      const newX = event.transform.rescaleX(x);
      xAxisGroup.call(xAxis.scale(newX));
      circles.attr('cx', d => newX(d.date));
      texts.attr('x', d => newX(d.date));
    }
  }, []);

  return (
    <Paper elevation={3} style={{ height: '90%', width: '100%', padding: '20px', margin: '0px' }}>
      <svg ref={ref}></svg>
    </Paper>
  );
};

export default TimelineUI;
